import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { DesignItem } from '../add-design-to-subtask/AddDesignToSubTaskUseCase';

export interface RemoveDesignFromSubTaskInput {
  taskId: string;
  subTaskId: string;
  designId: string;
}

export class RemoveDesignFromSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: RemoveDesignFromSubTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);

    const designs = (subTask.getMetadata().designs ?? []) as DesignItem[];
    const index = designs.findIndex((d) => d.id === input.designId);
    if (index === -1) throw new Error(`Design não encontrado: ${input.designId}`);

    subTask.updateMetadata({ designs: designs.filter((d) => d.id !== input.designId) });

    await this.taskRepository.save(task);
  }
}
