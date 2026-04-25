import { TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTaskStatus, SubTaskType } from '../../../../domain/entities/sub-task.entity';

export interface TaskOutput {
  id: string;
  projectId: string;
  name: string;
  taskNumber: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface CreatorOutput {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ApplicantOutput {
  id: string;
  name: string;
}

export interface FlowOutput {
  id: string;
  name: string;
}

export interface DesignOutput {
  id: string;
  title: string;
  description: string;
  urlImage: string;
  dateUpload: Date;
}

export interface DiscoveryFormOutput {
  complexity?: string;
  projectName?: string;
  summary?: string;
  painPoints?: string;
  frequency?: string;
  currentProcess?: string;
  inactionCost?: string;
  volume?: string;
  avgTime?: string;
  humanDependency?: string;
  rework?: string;
  previousAttempts?: string;
  benchmark?: string;
  institutionalPriority?: string;
  technicalOpinion?: string;
}

export interface SubTaskOutput {
  id: string;
  type: SubTaskType;
  status: SubTaskStatus;
  expectedDelivery: Date;
  startDate?: Date;
  completionDate?: Date;
  reason?: string;
  designs?: DesignOutput[];
  discoveryForm?: DiscoveryFormOutput;
}

export interface ProjectOutput {
  id: string;
  name: string;
}

export interface SubTaskSummaryOutput {
  type: SubTaskType;
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
  createdAt: Date;
}
