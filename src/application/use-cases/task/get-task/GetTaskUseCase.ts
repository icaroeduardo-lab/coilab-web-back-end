import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { TaskOutput } from '../shared/task-output';

export interface GetTaskInput {
  id: string;
}

export class GetTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetTaskInput): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(TaskId(input.id));
    if (!task) {
      throw new Error(`Task not found: ${input.id}`);
    }

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
  }
}
