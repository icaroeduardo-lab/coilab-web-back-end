import { Flow } from '../../../../domain/value-objects/flow.vo';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, FlowId } from '../../../../domain/shared/entity-ids';

export interface AddFlowToTaskInput {
  taskId: string;
  flowId: string;
  flowName: string;
}

export class AddFlowToTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddFlowToTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    task.addFlow(new Flow({ id: FlowId(input.flowId), name: input.flowName }));

    await this.taskRepository.save(task);
  }
}
