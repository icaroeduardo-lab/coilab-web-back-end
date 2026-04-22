import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { TaskOutput } from '../shared/task-output';

export interface ListTasksByProjectInput {
  projectId: string;
}

export class ListTasksByProjectUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: ListTasksByProjectInput): Promise<TaskOutput[]> {
    const tasks = await this.taskRepository.findByProjectId(ProjectId(input.projectId));

    return Promise.all(
      tasks.map(async (task) => {
        const creator = await this.userRepository.findById(task.getCreatorId());
        if (!creator) {
          throw new Error(`Creator not found: ${task.getCreatorId()}`);
        }
        return {
          id: task.getId(),
          projectId: task.getProjectId(),
          name: task.getName(),
          description: task.getDescription(),
          taskNumber: task.getTaskNumber(),
          priority: task.getPriority(),
          status: task.getStatus(),
          applicantId: task.getApplicantId(),
          creator: { id: creator.getId(), name: creator.getName(), imageUrl: creator.getImageUrl() },
          createdAt: task.getCreatedAt(),
        };
      }),
    );
  }
}
