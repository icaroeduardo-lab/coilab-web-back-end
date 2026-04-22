import { ProjectStatus } from '../../../../domain/entities/project.entity';

export interface ProjectOutput {
  id: string;
  projectNumber: string;
  name: string;
  description: string;
  urlDocument?: string;
  status: ProjectStatus;
  createdAt: Date;
}

export type ProjectListOutput = Omit<ProjectOutput, 'urlDocument'>;
