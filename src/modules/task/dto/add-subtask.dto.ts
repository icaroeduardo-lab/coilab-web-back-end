import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum } from 'class-validator';
import { SubTaskType } from '../../../domain/entities/sub-task.entity';

export class AddSubTaskDto {
  @ApiProperty({ enum: SubTaskType, enumName: 'SubTaskType' })
  @IsEnum(SubTaskType)
  type: SubTaskType;

  @ApiProperty({ example: '2026-12-31', description: 'Data esperada de entrega (ISO 8601)' })
  @IsDateString()
  expectedDelivery: string;
}
