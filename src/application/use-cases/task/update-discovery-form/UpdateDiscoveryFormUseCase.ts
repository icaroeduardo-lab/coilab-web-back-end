import {
  DiscoverySubTask,
  DiscoveryFormInput,
  SubTaskType,
} from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, ApplicantId } from '../../../../domain/shared/entity-ids';

export interface UpdateDiscoveryFormInput {
  taskId: string;
  subTaskId: string;
  userId: string;
  fields: Partial<DiscoveryFormInput>;
}

export class UpdateDiscoveryFormUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: UpdateDiscoveryFormInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) {
      throw new Error(`SubTask not found: ${input.subTaskId}`);
    }

    if (subTask.getType() !== SubTaskType.DISCOVERY) {
      throw new Error(`SubTask is not a Discovery type: ${input.subTaskId}`);
    }

    (subTask as DiscoverySubTask).updateForm(input.fields, ApplicantId(input.userId));

    await this.taskRepository.save(task);
  }
}
