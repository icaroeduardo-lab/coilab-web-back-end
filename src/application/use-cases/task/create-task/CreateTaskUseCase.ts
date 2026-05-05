import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
  TaskToolId,
} from '../../../../domain/shared/entity-ids';

import { generateNextNumber } from '../../../../domain/shared/sequential-number';
import { generateId } from '../../../../shared/generate-id';
import { TaskOutput } from '../shared/task-output';

export interface CreateTaskSubTaskInput {
  typeId: number;
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

const buildSubTask = (
  input: CreateTaskSubTaskInput,
  taskId: string,
  taskNumber: string,
): SubTask =>
  new SubTask({
    id: SubTaskId(generateId()),
    taskId: TaskId(taskId),
    idUser: UserId(input.idUser),
    status: SubTaskStatus.NAO_INICIADO,
    typeId: TaskToolId(input.typeId),
    taskNumber,
    expectedDelivery: input.expectedDelivery,
  });

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<TaskOutput> {
    const [lastTaskNumber, lastSubTaskNumber] = await Promise.all([
      this.taskRepository.findLastTaskNumber(),
      this.taskRepository.findLastSubTaskNumber(),
    ]);
    const taskNumber = generateNextNumber(lastTaskNumber);
    const taskId = generateId();

    let subTaskSeq = lastSubTaskNumber;
    const subTasks = (input.subTasks ?? []).map((s) => {
      subTaskSeq = generateNextNumber(subTaskSeq);
      return buildSubTask(s, taskId, subTaskSeq);
    });

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
