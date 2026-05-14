import { Canvas, ProjectStatus } from '../../../../domain/entities/project.entity';

export interface ProjectOutput {
  id: string;
  projectNumber: string;
  name: string;
  description: string;
  canvas?: Canvas;
  status: ProjectStatus;
  createdAt: Date;
}

export type ProjectListOutput = Omit<ProjectOutput, 'canvas'>;
