import { TaskPriority } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, ProjectId, ApplicantId, FlowId } from '../../../../domain/shared/entity-ids';

export interface UpdateTaskInput {
  id: string;
  name?: string;
  description?: string;
  priority?: TaskPriority;
  projectId?: string;
  applicantId?: string;
  flowIdsToAdd?: string[];
  flowIdsToRemove?: string[];
  subTaskIdsToRemove?: string[];
}

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.id));
    if (!task) {
      throw new Error(`Task not found: ${input.id}`);
    }

    if (input.name !== undefined) task.changeName(input.name);
    if (input.description !== undefined) task.changeDescription(input.description);
    if (input.priority !== undefined) task.changePriority(input.priority);
    if (input.projectId !== undefined) task.changeProjectId(ProjectId(input.projectId));
    if (input.applicantId !== undefined) task.changeApplicantId(ApplicantId(Number(input.applicantId)));
    if (input.flowIdsToAdd) {
      for (const flowId of input.flowIdsToAdd) {
        task.addFlowId(FlowId(Number(flowId)));
      }
    }
    if (input.flowIdsToRemove) {
      for (const flowId of input.flowIdsToRemove) {
        task.removeFlowId(FlowId(Number(flowId)));
      }
    }
    if (input.subTaskIdsToRemove) {
      for (const subTaskId of input.subTaskIdsToRemove) {
        task.removeSubTask(subTaskId);
      }
    }

    await this.taskRepository.save(task);
  }
}
