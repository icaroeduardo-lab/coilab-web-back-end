import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SubTaskAction } from '../../../application/use-cases/task/change-subtask-status/ChangeSubTaskStatusUseCase';

export class ChangeSubTaskStatusDto {
  @ApiProperty({ enum: ['start', 'complete', 'approve', 'reject', 'cancel', 'reopen'], example: 'start' })
  @IsIn(['start', 'complete', 'approve', 'reject', 'cancel', 'reopen'])
  action: SubTaskAction;

  @ApiPropertyOptional({ example: 'Layout não atende os requisitos de acessibilidade.' })
  @IsString()
  @IsOptional()
  reason?: string;
}
