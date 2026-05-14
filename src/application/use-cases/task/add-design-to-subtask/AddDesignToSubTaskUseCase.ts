import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';

export interface AddDesignToSubTaskInput {
  taskId: string;
  subTaskId: string;
  userId: string;
  title: string;
  description: string;
  urlImage: string;
}

export interface DesignItem {
  id: string;
  title: string;
  description: string;
  urlImage: string;
  userId: string;
  dateUpload: string;
}

export class AddDesignToSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddDesignToSubTaskInput): Promise<{ id: string }> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);

    const existing = (subTask.getMetadata().designs ?? []) as DesignItem[];
    const designId = generateId();
    const newDesign: DesignItem = {
      id: designId,
      title: input.title,
      description: input.description,
      urlImage: input.urlImage,
      userId: input.userId,
      dateUpload: new Date().toISOString(),
    };

    subTask.updateMetadata({ designs: [...existing, newDesign] });

    await this.taskRepository.save(task);
    return { id: designId };
  }
}
