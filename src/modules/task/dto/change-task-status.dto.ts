import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../../domain/entities/task.entity';

export class ChangeTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
