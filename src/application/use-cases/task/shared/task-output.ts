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
  id: number;
  name: string;
}

export interface FlowOutput {
  id: number;
  name: string;
}

export interface DesignOutput {
  id: string;
  title: string;
  description: string;
  urlImage: string;
  dateUpload: Date;
}

export interface DiscoveryUserOutput {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface DiscoveryFieldOutput {
  value: string;
  user: DiscoveryUserOutput;
  filledAt?: Date;
}

export interface DiscoveryFormOutput {
  complexity?: DiscoveryFieldOutput;
  projectName?: DiscoveryFieldOutput;
  summary?: DiscoveryFieldOutput;
  painPoints?: DiscoveryFieldOutput;
  frequency?: DiscoveryFieldOutput;
  currentProcess?: DiscoveryFieldOutput;
  inactionCost?: DiscoveryFieldOutput;
  volume?: DiscoveryFieldOutput;
  avgTime?: DiscoveryFieldOutput;
  humanDependency?: DiscoveryFieldOutput;
  rework?: DiscoveryFieldOutput;
  previousAttempts?: DiscoveryFieldOutput;
  benchmark?: DiscoveryFieldOutput;
  institutionalPriority?: DiscoveryFieldOutput;
  technicalOpinion?: DiscoveryFieldOutput;
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
