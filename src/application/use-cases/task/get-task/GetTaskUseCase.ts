import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export interface GetTaskInput {
  id: string;
}

export class GetTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: GetTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(TaskId(input.id));
    if (!task) {
      throw new Error(`Task not found: ${input.id}`);
    }
    return task;
  }
}
