import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'ID do setor solicitante' })
  @IsUUID()
  @IsOptional()
  applicantId?: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid-flow-1'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  flowIdsToAdd?: string[];

  @ApiPropertyOptional({ type: [String], example: ['uuid-flow-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  flowIdsToRemove?: string[];

  @ApiPropertyOptional({ type: [String], example: ['uuid-subtask-1'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  subTaskIdsToRemove?: string[];
}
