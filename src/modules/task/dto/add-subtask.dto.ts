import { IsDateString, IsEnum } from 'class-validator';
import { SubTaskType } from '../../../domain/entities/sub-task.entity';

export class AddSubTaskDto {
  @IsEnum(SubTaskType)
  type: SubTaskType;

  @IsDateString()
  expectedDelivery: string;
}
