import { TaskStatus } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export interface ChangeTaskStatusInput {
  id: string;
  status: TaskStatus;
}

export class ChangeTaskStatusUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: ChangeTaskStatusInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.id));
    if (!task) {
      throw new Error(`Task not found: ${input.id}`);
    }

    task.changeStatus(input.status);

    await this.taskRepository.save(task);
  }
}
