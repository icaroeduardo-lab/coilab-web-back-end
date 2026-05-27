import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export interface ToggleChecklistItemInput {
  taskId: string;
  itemId: string;
}

export class ToggleChecklistItemUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: ToggleChecklistItemInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.toggleChecklistItem(input.itemId);
    await this.taskRepository.save(task);
  }
}
