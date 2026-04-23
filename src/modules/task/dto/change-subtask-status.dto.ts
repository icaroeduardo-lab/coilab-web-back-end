import { IsIn, IsOptional, IsString } from 'class-validator';
import { SubTaskAction } from '../../../application/use-cases/task/change-subtask-status/ChangeSubTaskStatusUseCase';

export class ChangeSubTaskStatusDto {
  @IsIn(['start', 'complete', 'approve', 'reject', 'cancel'])
  action: SubTaskAction;

  @IsString()
  @IsOptional()
  reason?: string;
}
