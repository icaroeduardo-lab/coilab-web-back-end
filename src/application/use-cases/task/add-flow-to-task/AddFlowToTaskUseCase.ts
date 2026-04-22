import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, FlowId } from '../../../../domain/shared/entity-ids';

export interface AddFlowToTaskInput {
  taskId: string;
  flowId: string;
}

export class AddFlowToTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddFlowToTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    task.addFlowId(FlowId(input.flowId));

    await this.taskRepository.save(task);
  }
}
