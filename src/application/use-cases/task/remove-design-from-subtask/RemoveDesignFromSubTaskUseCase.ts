import { DesignSubTask, SubTaskType } from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, DesignId } from '../../../../domain/shared/entity-ids';

export interface RemoveDesignFromSubTaskInput {
  taskId: string;
  subTaskId: string;
  designId: string;
}

export class RemoveDesignFromSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: RemoveDesignFromSubTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) {
      throw new Error(`SubTask not found: ${input.subTaskId}`);
    }

    if (subTask.getType() !== SubTaskType.DESIGN) {
      throw new Error(`SubTask is not a Design type: ${input.subTaskId}`);
    }

    (subTask as DesignSubTask).removeDesign(DesignId(input.designId));

    await this.taskRepository.save(task);
  }
}
