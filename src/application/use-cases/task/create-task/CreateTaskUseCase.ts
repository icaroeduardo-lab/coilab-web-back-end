import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import {
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  SubTaskStatus,
  SubTaskType,
} from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
} from '../../../../domain/shared/entity-ids';

import { generateNextNumber } from '../../../../domain/shared/sequential-number';
import { generateId } from '../../../../shared/generate-id';
import { TaskOutput } from '../shared/task-output';

export interface CreateTaskSubTaskInput {
  type: SubTaskType;
  idUser: string;
  expectedDelivery: Date;
}

export interface CreateTaskInput {
  projectId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  applicantId: string;
  creatorId: string;
  flowIds?: string[];
  subTasks?: CreateTaskSubTaskInput[];
}

const buildSubTask = (input: CreateTaskSubTaskInput, taskId: string) => {
  const base = {
    id: SubTaskId(generateId()),
    taskId: TaskId(taskId),
    idUser: UserId(input.idUser),
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: input.expectedDelivery,
  };

  switch (input.type) {
    case SubTaskType.DISCOVERY:
      return new DiscoverySubTask(base);
    case SubTaskType.DESIGN:
      return new DesignSubTask(base);
    case SubTaskType.DIAGRAM:
      return new DiagramSubTask(base);
  }
};

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<TaskOutput> {
    const lastNumber = await this.taskRepository.findLastTaskNumber();
    const taskNumber = generateNextNumber(lastNumber);
    const taskId = generateId();

    const subTasks = (input.subTasks ?? []).map((s) => buildSubTask(s, taskId));

    const task = new Task({
      id: TaskId(taskId),
      projectId: ProjectId(input.projectId),
      name: input.name,
      description: input.description,
      taskNumber,
      priority: input.priority,
      status: TaskStatus.BACKLOG,
      applicantId: ApplicantId(Number(input.applicantId)),
      creatorId: UserId(input.creatorId),
      flowIds: (input.flowIds ?? []).map((id) => FlowId(Number(id))),
      subTasks,
    });

    await this.taskRepository.save(task);

    return {
      id: task.getId(),
      projectId: task.getProjectId(),
      name: task.getName(),
      taskNumber: task.getTaskNumber(),
      priority: task.getPriority(),
      status: task.getStatus(),
    };
  }
}
