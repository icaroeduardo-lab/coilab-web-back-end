import { Task } from '../../../../domain/entities/task.entity';
import {
  DesignSubTask,
  DiscoverySubTask,
  DiscoveryFieldEntry,
} from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { TaskId, UserId } from '../../../../domain/shared/entity-ids';
import { TaskDetailOutput, SubTaskOutput, DiscoveryUserOutput } from '../shared/task-output';
import { User } from '../../../../domain/entities/user.entity';

export interface GetTaskInput {
  id: string;
}

function toUserOutput(user: User): DiscoveryUserOutput {
  return { id: user.getId(), name: user.getName(), imageUrl: user.getImageUrl() };
}

function collectDiscoveryUserIds(task: Task): Set<string> {
  const ids = new Set<string>();
  for (const s of task.getSubTasks()) {
    if (!(s instanceof DiscoverySubTask)) continue;
    const form = s.getForm();
    const fields = [
      form.complexity,
      form.projectName,
      form.summary,
      form.painPoints,
      form.frequency,
      form.currentProcess,
      form.inactionCost,
      form.volume,
      form.avgTime,
      form.humanDependency,
      form.rework,
      form.previousAttempts,
      form.benchmark,
      form.institutionalPriority,
      form.technicalOpinion,
    ];
    for (const f of fields) {
      if (f?.userId) ids.add(f.userId);
    }
  }
  return ids;
}

function mapSubTasks(task: Task, userMap: Map<string, User>): SubTaskOutput[] {
  return task.getSubTasks().map((s) => {
    const base: SubTaskOutput = {
      id: s.getId(),
      type: s.getType(),
      status: s.getStatus(),
      expectedDelivery: s.getExpectedDelivery(),
      startDate: s.getStartDate(),
      completionDate: s.getCompletionDate(),
      reason: s.getReason(),
    };
    if (s instanceof DesignSubTask) {
      base.designs = s.getDesigns().map((d) => ({
        id: d.getId(),
        title: d.getTitle(),
        description: d.getDescription(),
        urlImage: d.getUrlImage(),
        dateUpload: d.getDateUpload(),
      }));
    }
    if (s instanceof DiscoverySubTask) {
      const form = s.getForm();
      const mapField = (f?: DiscoveryFieldEntry<string>) => {
        if (!f) return undefined;
        const user = userMap.get(f.userId);
        return {
          value: String(f.value),
          user: user ? toUserOutput(user) : { id: f.userId, name: 'Desconhecido' },
          filledAt: f.filledAt,
        };
      };
      base.discoveryForm = {
        complexity: mapField(form.complexity),
        projectName: mapField(form.projectName),
        summary: mapField(form.summary),
        painPoints: mapField(form.painPoints),
        frequency: mapField(form.frequency),
        currentProcess: mapField(form.currentProcess),
        inactionCost: mapField(form.inactionCost),
        volume: mapField(form.volume),
        avgTime: mapField(form.avgTime),
        humanDependency: mapField(form.humanDependency),
        rework: mapField(form.rework),
        previousAttempts: mapField(form.previousAttempts),
        benchmark: mapField(form.benchmark),
        institutionalPriority: mapField(form.institutionalPriority),
        technicalOpinion: mapField(form.technicalOpinion),
      };
    }
    return base;
  });
}

export class GetTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
    private readonly applicantRepository: IApplicantRepository,
    private readonly flowRepository: IFlowRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: GetTaskInput): Promise<TaskDetailOutput> {
    const task = await this.taskRepository.findById(TaskId(input.id));
    if (!task) {
      throw new Error(`Task not found: ${input.id}`);
    }

    const discoveryUserIds = collectDiscoveryUserIds(task);

    const [creator, applicant, flows, project, ...discoveryUsers] = await Promise.all([
      this.userRepository.findById(task.getCreatorId()),
      this.applicantRepository.findById(task.getApplicantId()),
      this.flowRepository.findByIds(task.getFlowIds()),
      this.projectRepository.findById(task.getProjectId()),
      ...[...discoveryUserIds].map((uid) => this.userRepository.findById(uid as UserId)),
    ]);

    if (!creator) throw new Error(`Creator not found: ${task.getCreatorId()}`);
    if (!applicant) throw new Error(`Applicant not found: ${task.getApplicantId()}`);
    if (!project) throw new Error(`Project not found: ${task.getProjectId()}`);

    const userMap = new Map<string, User>();
    for (const u of discoveryUsers) {
      if (u) userMap.set(u.getId(), u);
    }

    return {
      id: task.getId(),
      name: task.getName(),
      description: task.getDescription(),
      taskNumber: task.getTaskNumber(),
      priority: task.getPriority(),
      status: task.getStatus(),
      project: { id: project.getId(), name: project.getName() },
      applicant: { id: applicant.getId(), name: applicant.getName() },
      creator: { id: creator.getId(), name: creator.getName(), imageUrl: creator.getImageUrl() },
      flows: flows.map((f) => ({ id: f.getId(), name: f.getName() })),
      subTasks: mapSubTasks(task, userMap),
      createdAt: task.getCreatedAt(),
    };
  }
}
