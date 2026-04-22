import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { TaskOutput } from '../shared/task-output';

export interface ListTasksByProjectInput {
  projectId: string;
}

export class ListTasksByProjectUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: ListTasksByProjectInput): Promise<TaskOutput[]> {
    const tasks = await this.taskRepository.findByProjectId(ProjectId(input.projectId));

    return tasks.map((task) => ({
      id: task.getId(),
      projectId: task.getProjectId(),
      name: task.getName(),
      taskNumber: task.getTaskNumber(),
      priority: task.getPriority(),
      status: task.getStatus(),
    }));
  }
}
