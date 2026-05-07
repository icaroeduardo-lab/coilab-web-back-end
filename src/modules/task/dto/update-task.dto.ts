import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TaskPriority } from '../../../domain/entities/task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Novo nome da tarefa' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Descrição atualizada.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, enumName: 'TaskPriority' })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID inteiro do setor solicitante' })
  @IsInt()
  @Min(1)
  @IsOptional()
  applicantId?: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  flowIdsToAdd?: number[];

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  flowIdsToRemove?: number[];

  @ApiPropertyOptional({ type: [String], example: ['uuid-subtask-1'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  subTaskIdsToRemove?: string[];
}
