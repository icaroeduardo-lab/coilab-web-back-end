import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TaskPriority } from '../../../domain/entities/task.entity';

class SubTaskDto {
  @ApiProperty({ example: 1, description: 'ID do tipo de subtarefa (TaskToolId)' })
  @IsInt()
  @Min(1)
  typeId: number;

  @ApiProperty({ example: '2026-12-31', description: 'Data esperada de entrega (ISO 8601)' })
  @IsDateString()
  expectedDelivery: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'Redesign da tela de checkout' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Melhorar a conversão do fluxo de compra reduzindo o número de etapas.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: TaskPriority, enumName: 'TaskPriority' })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ example: 1, description: 'ID inteiro do setor solicitante' })
  @IsInt()
  @Min(1)
  applicantId: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  flowIds?: number[];

  @ApiPropertyOptional({ type: [SubTaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubTaskDto)
  @IsOptional()
  subTasks?: SubTaskDto[];
}
