import { TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';

export interface CreatorOutput {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface TaskOutput {
  id: string;
  projectId: string;
  name: string;
  description: string;
  taskNumber: string;
  priority: TaskPriority;
  status: TaskStatus;
  applicantId: string;
  creator: CreatorOutput;
  createdAt: Date;
}
