import {
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  SubTaskStatus,
  SubTaskType,
} from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, UserId, SubTaskId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';

export interface AddSubTaskToTaskInput {
  taskId: string;
  type: SubTaskType;
  idUser: string;
  expectedDelivery: Date;
}

export class AddSubTaskToTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddSubTaskToTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    const base = {
      id: SubTaskId(generateId()),
      taskId: TaskId(input.taskId),
      idUser: UserId(input.idUser),
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: input.expectedDelivery,
    };

    switch (input.type) {
      case SubTaskType.DISCOVERY:
        task.addSubTask(new DiscoverySubTask(base));
        break;
      case SubTaskType.DESIGN:
        task.addSubTask(new DesignSubTask(base));
        break;
      case SubTaskType.DIAGRAM:
        task.addSubTask(new DiagramSubTask(base));
        break;
    }

    await this.taskRepository.save(task);
  }
}
