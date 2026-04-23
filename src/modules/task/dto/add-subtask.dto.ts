import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { SubTaskType } from '../../../domain/entities/sub-task.entity';

export class AddSubTaskDto {
  @IsEnum(SubTaskType)
  type: SubTaskType;

  @IsUUID()
  @IsNotEmpty()
  idUser: string;

  @IsDateString()
  expectedDelivery: string;
}
