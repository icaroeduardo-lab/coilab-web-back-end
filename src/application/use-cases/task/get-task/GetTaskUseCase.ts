import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { TaskDetailOutput, SubTaskOutput } from '../shared/task-output';

export interface GetTaskInput {
  id: string;
}

function mapSubTasks(task: Task): SubTaskOutput[] {
  return task.getSubTasks().map((s) => ({
    id: s.getId(),
    type: s.getType(),
    status: s.getStatus(),
    expectedDelivery: s.getExpectedDelivery(),
    startDate: s.getStartDate(),
    completionDate: s.getCompletionDate(),
  }));
}

export class GetTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
    private readonly applicantRepository: IApplicantRepository,
    private readonly flowRepository: IFlowRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: GetTaskInput): Promise<TaskDetailOutput> {
    const task = await this.taskRepository.findById(TaskId(input.id));
    if (!task) {
      throw new Error(`Task not found: ${input.id}`);
    }

    const [creator, applicant, flows, project] = await Promise.all([
      this.userRepository.findById(task.getCreatorId()),
      this.applicantRepository.findById(task.getApplicantId()),
      this.flowRepository.findByIds(task.getFlowIds()),
      this.projectRepository.findById(task.getProjectId()),
    ]);

    if (!creator) throw new Error(`Creator not found: ${task.getCreatorId()}`);
    if (!applicant) throw new Error(`Applicant not found: ${task.getApplicantId()}`);
    if (!project) throw new Error(`Project not found: ${task.getProjectId()}`);

    return {
      id: task.getId(),
      name: task.getName(),
      description: task.getDescription(),
      taskNumber: task.getTaskNumber(),
      priority: task.getPriority(),
      status: task.getStatus(),
      project: { id: project.getId(), name: project.getName() },
      applicant: { id: applicant.getId(), name: applicant.getName() },
      creator: { id: creator.getId(), name: creator.getName(), imageUrl: creator.getImageUrl() },
      flows: flows.map((f) => ({ id: f.getId(), name: f.getName() })),
      subTasks: mapSubTasks(task),
      createdAt: task.getCreatedAt(),
    };
  }
}
