import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export interface RemoveChecklistItemInput {
  taskId: string;
  itemId: string;
}

export class RemoveChecklistItemUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: RemoveChecklistItemInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.removeChecklistItem(input.itemId);
    await this.taskRepository.save(task);
  }
}
