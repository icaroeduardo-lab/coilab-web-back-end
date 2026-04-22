import { Project } from '../entities/project.entity';
import { ProjectId } from '../shared/entity-ids';

export interface IProjectRepository {
  findById(id: ProjectId): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  save(project: Project): Promise<void>;
}
