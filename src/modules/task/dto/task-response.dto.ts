import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../../../domain/entities/task.entity';
import { SubTaskStatus } from '../../../domain/entities/sub-task.entity';

export class TaskTypeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class ApplicantResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class CreatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  imageUrl?: string;
}

export class FlowResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class SubTaskSummaryResponseDto {
  @ApiProperty()
  typeId: number;

  @ApiProperty({ enum: SubTaskStatus, enumName: 'SubTaskStatus' })
  status: SubTaskStatus;
}

export class SubTaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  typeId: number;

  @ApiProperty({ enum: SubTaskStatus, enumName: 'SubTaskStatus' })
  status: SubTaskStatus;

  @ApiProperty()
  expectedDelivery: Date;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  completionDate?: Date;

  @ApiPropertyOptional()
  reason?: string;

  @ApiProperty()
  metadata: Record<string, unknown>;
}

export class TaskResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  projectId: string;

  @ApiProperty({ example: 'Redesign da tela de checkout' })
  name: string;

  @ApiProperty({ example: '#20260001' })
  taskNumber: string;

  @ApiProperty({ enum: TaskPriority, enumName: 'TaskPriority' })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskStatus, enumName: 'TaskStatus' })
  status: TaskStatus;

  @ApiProperty({ example: 1, description: '1 = feature, 2 = bug' })
  typeId: number;
}

export class TaskListItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  taskNumber: string;

  @ApiProperty({ enum: TaskPriority, enumName: 'TaskPriority' })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskStatus, enumName: 'TaskStatus' })
  status: TaskStatus;

  @ApiProperty({ example: 1, description: '1 = feature, 2 = bug' })
  typeId: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ProjectResponseDto })
  project: ProjectResponseDto;

  @ApiProperty({ type: ApplicantResponseDto })
  applicant: ApplicantResponseDto;

  @ApiProperty({ type: [SubTaskSummaryResponseDto] })
  subTasks: SubTaskSummaryResponseDto[];
}

export class TaskListResponseDto {
  @ApiProperty({ type: [TaskListItemResponseDto] })
  data: TaskListItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class TaskDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  taskNumber: string;

  @ApiProperty({ enum: TaskPriority, enumName: 'TaskPriority' })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskStatus, enumName: 'TaskStatus' })
  status: TaskStatus;

  @ApiProperty({ example: 1, description: '1 = feature, 2 = bug' })
  typeId: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ProjectResponseDto })
  project: ProjectResponseDto;

  @ApiProperty({ type: ApplicantResponseDto })
  applicant: ApplicantResponseDto;

  @ApiProperty({ type: CreatorResponseDto })
  creator: CreatorResponseDto;

  @ApiProperty({ type: [FlowResponseDto] })
  flows: FlowResponseDto[];

  @ApiProperty({ type: [SubTaskResponseDto] })
  subTasks: SubTaskResponseDto[];
}
