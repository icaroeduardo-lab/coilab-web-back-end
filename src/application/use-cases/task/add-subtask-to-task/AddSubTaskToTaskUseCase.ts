import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId, UserId, SubTaskId, TaskToolId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';
import { generateNextNumber } from '../../../../domain/shared/sequential-number';

export interface AddSubTaskToTaskInput {
  taskId: string;
  typeId: number;
  idUser: string;
  expectedDelivery: Date;
}

export class AddSubTaskToTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddSubTaskToTaskInput): Promise<void> {
    const [task, lastSubTaskNumber] = await Promise.all([
      this.taskRepository.findById(TaskId(input.taskId)),
      this.taskRepository.findLastSubTaskNumber(),
    ]);
    if (!task) {
      throw new Error(`Task not found: ${input.taskId}`);
    }

    task.addSubTask(
      new SubTask({
        id: SubTaskId(generateId()),
        taskId: TaskId(input.taskId),
        idUser: UserId(input.idUser),
        status: SubTaskStatus.NAO_INICIADO,
        typeId: TaskToolId(input.typeId),
        taskNumber: generateNextNumber(lastSubTaskNumber),
        expectedDelivery: input.expectedDelivery,
      }),
    );

    await this.taskRepository.save(task);
  }
}
