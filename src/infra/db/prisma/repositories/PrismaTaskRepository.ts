import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
  TaskToolId,
} from '../../../../domain/shared/entity-ids';

import { prisma } from '../prisma.client';
import { Prisma } from '../../../../generated/prisma/client';
import type {
  Task as PrismaTask,
  SubTask as PrismaSubTask,
} from '../../../../generated/prisma/client';

const STATUS_TO_ID: Record<TaskStatus, number> = {
  [TaskStatus.BACKLOG]: 1,
  [TaskStatus.EM_EXECUCAO]: 2,
  [TaskStatus.CHECKOUT]: 3,
  [TaskStatus.DESENVOLVIMENTO]: 4,
  [TaskStatus.TESTES]: 5,
  [TaskStatus.CONCLUIDO]: 6,
};

const ID_TO_STATUS: Record<number, TaskStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_ID).map(([k, v]) => [v, k as TaskStatus]),
);

type TaskWithRelations = PrismaTask & {
  subTasks: PrismaSubTask[];
  flows: { flowId: number }[];
};

function subTaskToDomain(row: PrismaSubTask): SubTask {
  return new SubTask({
    id: SubTaskId(row.id),
    taskId: TaskId(row.taskId),
    idUser: UserId(row.idUser),
    status: row.status as SubTaskStatus,
    typeId: TaskToolId(row.typeId),
    expectedDelivery: row.expectedDelivery,
    createdAt: row.createdAt,
    startDate: row.startDate ?? undefined,
    completionDate: row.completionDate ?? undefined,
    reason: row.reason ?? undefined,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  });
}

function taskToDomain(row: TaskWithRelations): Task {
  return new Task({
    id: TaskId(row.id),
    projectId: ProjectId(row.projectId),
    name: row.name,
    description: row.description,
    taskNumber: row.taskNumber,
    priority: row.priority as TaskPriority,
    status: ID_TO_STATUS[row.statusId] ?? TaskStatus.BACKLOG,
    applicantId: ApplicantId(row.applicantId),
    creatorId: UserId(row.creatorId),
    createdAt: row.createdAt,
    subTasks: row.subTasks.map(subTaskToDomain),
    flowIds: row.flows.map((f) => FlowId(f.flowId)),
  });
}

type JsonInput = Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;

function serializeSubTask(
  subTask: SubTask,
  parentTaskId: string,
): {
  id: string;
  taskId: string;
  idUser: string;
  status: string;
  typeId: number;
  expectedDelivery: Date;
  createdAt: Date;
  startDate: Date | null;
  completionDate: Date | null;
  reason: string | null;
  metadata: JsonInput;
} {
  const metadata = subTask.getMetadata();
  return {
    id: subTask.getId(),
    taskId: parentTaskId,
    idUser: subTask.getIdUser(),
    status: subTask.getStatus(),
    typeId: subTask.getTypeId(),
    expectedDelivery: subTask.getExpectedDelivery(),
    createdAt: subTask.getCreatedAt(),
    startDate: subTask.getStartDate() ?? null,
    completionDate: subTask.getCompletionDate() ?? null,
    reason: subTask.getReason() ?? null,
    metadata: Object.keys(metadata).length > 0
      ? (metadata as Prisma.InputJsonValue)
      : (Prisma.DbNull as JsonInput),
  };
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

  async findAll(opts?: { skip?: number; take?: number }): Promise<Task[]> {
    const rows = await prisma.task.findMany({
      include: taskInclude,
      orderBy: { createdAt: 'asc' },
      ...opts,
    });
    return rows.map((r) => taskToDomain(r as TaskWithRelations));
  }

  async count(): Promise<number> {
    return prisma.task.count();
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
    const serializedSubTasks = task.getSubTasks().map((s) => serializeSubTask(s, task.getId()));
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
          statusId: STATUS_TO_ID[task.getStatus()],
          applicantId: task.getApplicantId(),
          creatorId: task.getCreatorId(),
          createdAt: task.getCreatedAt(),
        },
        update: {
          name: task.getName(),
          description: task.getDescription(),
          priority: task.getPriority(),
          statusId: STATUS_TO_ID[task.getStatus()],
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
