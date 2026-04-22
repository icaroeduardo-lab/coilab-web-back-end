import { TaskPriority } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, ApplicantId } from '../../../../domain/shared/entity-ids';

export interface UpdateTaskInput {
  id: string;
  name?: string;
  description?: string;
  taskNumber?: string;
  priority?: TaskPriority;
  applicantId?: string;
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
    if (input.taskNumber !== undefined) task.changeTaskNumber(input.taskNumber);
    if (input.priority !== undefined) task.changePriority(input.priority);
    if (input.applicantId !== undefined) task.changeApplicantId(ApplicantId(input.applicantId));

    await this.taskRepository.save(task);
  }
}
