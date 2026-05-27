import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export interface AddChecklistItemInput {
  taskId: string;
  label: string;
}

export class AddChecklistItemUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddChecklistItemInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.addChecklistItem(input.label);
    await this.taskRepository.save(task);
  }
}
