import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../../domain/entities/task.entity';

export class ChangeTaskStatusDto {
  @ApiProperty({ enum: TaskStatus, enumName: 'TaskStatus' })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
