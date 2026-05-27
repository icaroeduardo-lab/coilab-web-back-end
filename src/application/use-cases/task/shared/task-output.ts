import { TaskPriority, TaskStatus, TaskType } from '../../../../domain/entities/task.entity';
import { SubTaskStatus } from '../../../../domain/entities/sub-task.entity';

export const TASK_TYPE_TO_ID: Record<TaskType, number> = {
  [TaskType.FEATURE]: 1,
  [TaskType.BUG]: 2,
};

export const ID_TO_TASK_TYPE: Record<number, TaskType> = {
  1: TaskType.FEATURE,
  2: TaskType.BUG,
};

export interface TaskOutput {
  id: string;
  projectId: string;
  name: string;
  taskNumber: string;
  priority: TaskPriority;
  status: TaskStatus;
  typeId: number;
}

export interface CreatorOutput {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ApplicantOutput {
  id: number;
  name: string;
}

export interface FlowOutput {
  id: number;
  name: string;
}

export interface SubTaskOutput {
  id: string;
  typeId: number;
  status: SubTaskStatus;
  expectedDelivery: Date;
  startDate?: Date;
  completionDate?: Date;
  reason?: string;
  metadata: Record<string, unknown>;
}

export interface ChecklistItemOutput {
  id: string;
  label: string;
  checked: boolean;
  order: number;
}

export interface ProjectOutput {
  id: string;
  name: string;
}

export interface SubTaskSummaryOutput {
  typeId: number;
  status: SubTaskStatus;
}

export interface TaskListOutput extends Omit<TaskOutput, 'projectId'> {
  description: string;
  project: ProjectOutput;
  applicant: ApplicantOutput;
  subTasks: SubTaskSummaryOutput[];
  createdAt: Date;
}

export interface TaskDetailOutput extends Omit<TaskOutput, 'projectId'> {
  description: string;
  project: ProjectOutput;
  applicant: ApplicantOutput;
  creator: CreatorOutput;
  flows: FlowOutput[];
  subTasks: SubTaskOutput[];
  checklistItems: ChecklistItemOutput[];
  createdAt: Date;
}
