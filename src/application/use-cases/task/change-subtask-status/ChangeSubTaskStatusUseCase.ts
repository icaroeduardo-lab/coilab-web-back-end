import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';

export type SubTaskAction = 'start' | 'complete' | 'approve' | 'reject' | 'cancel';

export interface ChangeSubTaskStatusInput {
  taskId: string;
  subTaskId: string;
  action: SubTaskAction;
  reason?: string;
}

export class ChangeSubTaskStatusUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: ChangeSubTaskStatusInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) {
      throw new Error(`SubTask not found: ${input.subTaskId}`);
    }

    switch (input.action) {
      case 'start':
        subTask.start();
        break;
      case 'complete':
        subTask.complete();
        break;
      case 'approve':
        subTask.approve();
        break;
      case 'reject':
        if (!input.reason) throw new Error('reason is required for reject');
        subTask.reject(input.reason);
        break;
      case 'cancel':
        if (!input.reason) throw new Error('reason is required for cancel');
        subTask.cancel(input.reason);
        break;
    }

    task.changeStatus(task.getStatus());

    await this.taskRepository.save(task);
  }
}
