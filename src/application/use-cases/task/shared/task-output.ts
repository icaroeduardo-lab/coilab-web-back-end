import { TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTaskStatus, SubTaskType } from '../../../../domain/entities/sub-task.entity';

export interface CreatorOutput {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface SubTaskOutput {
  id: string;
  type: SubTaskType;
  status: SubTaskStatus;
  expectedDelivery: Date;
  startDate?: Date;
  completionDate?: Date;
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
  flowIds: string[];
  subTasks: SubTaskOutput[];
  createdAt: Date;
}
