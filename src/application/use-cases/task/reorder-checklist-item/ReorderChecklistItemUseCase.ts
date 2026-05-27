import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export interface ReorderChecklistItemInput {
  taskId: string;
  itemId: string;
  order: number;
}

export class ReorderChecklistItemUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: ReorderChecklistItemInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.reorderChecklistItem(input.itemId, input.order);
    await this.taskRepository.save(task);
  }
}
