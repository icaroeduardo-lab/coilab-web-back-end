import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';

export interface ListTasksByProjectInput {
  projectId: string;
}

export class ListTasksByProjectUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: ListTasksByProjectInput): Promise<Task[]> {
    return this.taskRepository.findByProjectId(ProjectId(input.projectId));
  }
}
