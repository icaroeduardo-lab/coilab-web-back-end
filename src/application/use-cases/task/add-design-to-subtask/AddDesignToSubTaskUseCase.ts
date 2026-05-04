import { DesignSubTask, SubTaskType } from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Design } from '../../../../domain/value-objects/design.vo';
import { TaskId, UserId, DesignId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';

export interface AddDesignToSubTaskInput {
  taskId: string;
  subTaskId: string;
  userId: string;
  title: string;
  description: string;
  urlImage: string;
}

export class AddDesignToSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddDesignToSubTaskInput): Promise<{ id: string }> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) {
      throw new Error(`SubTask not found: ${input.subTaskId}`);
    }

    if (subTask.getType() !== SubTaskType.DESIGN) {
      throw new Error(`SubTask is not a Design type: ${input.subTaskId}`);
    }

    const designId = generateId();
    const design = new Design({
      id: DesignId(designId),
      title: input.title,
      description: input.description,
      urlImage: input.urlImage,
      user: UserId(input.userId),
      dateUpload: new Date(),
    });

    (subTask as DesignSubTask).addDesign(design);

    await this.taskRepository.save(task);
    return { id: designId };
  }
}
