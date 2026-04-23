import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TaskPriority } from '../../../domain/entities/task.entity';
import { SubTaskType } from '../../../domain/entities/sub-task.entity';

class SubTaskDto {
  @IsEnum(SubTaskType)
  type: SubTaskType;

  @IsUUID()
  @IsNotEmpty()
  idUser: string;

  @IsDateString()
  expectedDelivery: string;
}

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsUUID()
  @IsNotEmpty()
  applicantId: string;

  @IsUUID()
  @IsNotEmpty()
  creatorId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  flowIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubTaskDto)
  @IsOptional()
  subTasks?: SubTaskDto[];
}
