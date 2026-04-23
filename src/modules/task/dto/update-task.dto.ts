import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskPriority } from '../../../domain/entities/task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsUUID()
  @IsOptional()
  applicantId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  flowIdsToAdd?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  flowIdsToRemove?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  subTaskIdsToRemove?: string[];
}
