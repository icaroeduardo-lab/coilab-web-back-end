import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import {
  SubTask,
  SubTaskStatus,
  SubTaskType,
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  DiscoveryFormProps,
} from '../../../../domain/entities/sub-task.entity';
import { Design } from '../../../../domain/value-objects/design.vo';
import { Diagram } from '../../../../domain/value-objects/diagram.vo';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
  DesignId,
} from '../../../../domain/shared/entity-ids';
import { prisma } from '../prisma.client';
import { Prisma } from '../../../../generated/prisma/client';
import type { Task as PrismaTask, SubTask as PrismaSubTask } from '../../../../generated/prisma/client';

type TaskWithRelations = PrismaTask & {
  subTasks: PrismaSubTask[];
  flows: { flowId: string }[];
};

function subTaskToDomain(row: PrismaSubTask): SubTask {
  const base = {
    id: SubTaskId(row.id),
    taskId: TaskId(row.taskId),
    idUser: ApplicantId(row.idUser),
    status: row.status as SubTaskStatus,
    expectedDelivery: row.expectedDelivery,
    createdAt: row.createdAt,
    startDate: row.startDate ?? undefined,
    completionDate: row.completionDate ?? undefined,
    reason: row.reason ?? undefined,
  };

  if (row.type === SubTaskType.DISCOVERY) {
    const form = (row.discoveryForm ?? {}) as Record<string, unknown>;
    return new DiscoverySubTask({ ...base, ...(form as DiscoveryFormProps) });
  }

  if (row.type === SubTaskType.DESIGN) {
    const rawDesigns = Array.isArray(row.designs) ? (row.designs as Record<string, unknown>[]) : [];
    const designs = rawDesigns.map(
      (d) =>
        new Design({
          id: DesignId(d.id as string),
          title: d.title as string,
          description: d.description as string,
          urlImage: d.urlImage as string,
          user: ApplicantId(d.user as string),
          dateUpload: new Date(d.dateUpload as string),
        }),
    );
    return new DesignSubTask({ ...base, designs });
  }

  // DIAGRAM
  const rawDiagrams = Array.isArray(row.diagrams) ? (row.diagrams as Record<string, unknown>[]) : [];
  const diagrams = rawDiagrams.map(
    (d) =>
      new Diagram({
        title: d.title as string,
        description: d.description as string,
        urlDiagram: d.urlDiagram as string,
        user: ApplicantId(d.user as string),
        dateUpload: new Date(d.dateUpload as string),
      }),
  );
  return new DiagramSubTask({ ...base, diagrams });
}

function taskToDomain(row: TaskWithRelations): Task {
  return new Task({
    id: TaskId(row.id),
    projectId: ProjectId(row.projectId),
    name: row.name,
    description: row.description,
    taskNumber: row.taskNumber,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    applicantId: ApplicantId(row.applicantId),
    creatorId: UserId(row.creatorId),
    createdAt: row.createdAt,
    subTasks: row.subTasks.map(subTaskToDomain),
    flowIds: row.flows.map((f) => FlowId(f.flowId)),
  });
}

type JsonInput = Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;

function serializeSubTask(subTask: SubTask): {
  id: string;
  taskId: string;
  idUser: string;
  status: string;
  type: string;
  expectedDelivery: Date;
  createdAt: Date;
  startDate: Date | null;
  completionDate: Date | null;
  reason: string | null;
  discoveryForm: JsonInput;
  designs: JsonInput;
  diagrams: JsonInput;
} {
  const base = {
    id: subTask.getId(),
    taskId: subTask.getTaskId(),
    idUser: subTask.getIdUser(),
    status: subTask.getStatus(),
    type: subTask.getType(),
    expectedDelivery: subTask.getExpectedDelivery(),
    createdAt: subTask.getCreatedAt(),
    startDate: subTask.getStartDate() ?? null,
    completionDate: subTask.getCompletionDate() ?? null,
    reason: subTask.getReason() ?? null,
    discoveryForm: Prisma.DbNull as JsonInput,
    designs: Prisma.DbNull as JsonInput,
    diagrams: Prisma.DbNull as JsonInput,
  };

  if (subTask instanceof DiscoverySubTask) {
    base.discoveryForm = subTask.getForm() as Prisma.InputJsonValue;
  } else if (subTask instanceof DesignSubTask) {
    base.designs = subTask.getDesigns().map((d) => ({
      id: d.getId(),
      title: d.getTitle(),
      description: d.getDescription(),
      urlImage: d.getUrlImage(),
      user: d.getUser(),
      dateUpload: d.getDateUpload().toISOString(),
    })) as Prisma.InputJsonValue;
  } else if (subTask instanceof DiagramSubTask) {
    base.diagrams = subTask.getDiagrams().map((d) => ({
      title: d.getTitle(),
      description: d.getDescription(),
      urlDiagram: d.getUrlDiagram(),
      user: d.getUser(),
      dateUpload: d.getDateUpload().toISOString(),
    })) as Prisma.InputJsonValue;
  }

  return base;
}

const taskInclude = {
  subTasks: true,
  flows: { select: { flowId: true } },
} as const;

export class PrismaTaskRepository implements ITaskRepository {
  async findById(id: TaskId): Promise<Task | null> {
    const row = await prisma.task.findUnique({ where: { id }, include: taskInclude });
    return row ? taskToDomain(row as TaskWithRelations) : null;
  }

  async findAll(): Promise<Task[]> {
    const rows = await prisma.task.findMany({ include: taskInclude, orderBy: { createdAt: 'asc' } });
    return rows.map((r) => taskToDomain(r as TaskWithRelations));
  }

  async findByProjectId(projectId: ProjectId): Promise<Task[]> {
    const rows = await prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => taskToDomain(r as TaskWithRelations));
  }

  async findLastTaskNumber(): Promise<string | null> {
    const row = await prisma.task.findFirst({ orderBy: { taskNumber: 'desc' } });
    return row?.taskNumber ?? null;
  }

  async save(task: Task): Promise<void> {
    const serializedSubTasks = task.getSubTasks().map(serializeSubTask);
    const flowIds = task.getFlowIds();

    await prisma.$transaction(async (tx) => {
      await tx.task.upsert({
        where: { id: task.getId() },
        create: {
          id: task.getId(),
          projectId: task.getProjectId(),
          name: task.getName(),
          description: task.getDescription(),
          taskNumber: task.getTaskNumber(),
          priority: task.getPriority(),
          status: task.getStatus(),
          applicantId: task.getApplicantId(),
          creatorId: task.getCreatorId(),
          createdAt: task.getCreatedAt(),
        },
        update: {
          name: task.getName(),
          description: task.getDescription(),
          priority: task.getPriority(),
          status: task.getStatus(),
          applicantId: task.getApplicantId(),
          projectId: task.getProjectId(),
        },
      });

      await tx.subTask.deleteMany({ where: { taskId: task.getId() } });
      if (serializedSubTasks.length > 0) {
        await tx.subTask.createMany({ data: serializedSubTasks });
      }

      await tx.taskFlow.deleteMany({ where: { taskId: task.getId() } });
      if (flowIds.length > 0) {
        await tx.taskFlow.createMany({
          data: flowIds.map((flowId) => ({ taskId: task.getId(), flowId })),
        });
      }
    });
  }

  async delete(id: TaskId): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}
