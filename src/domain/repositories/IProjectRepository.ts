import { Project } from '../entities/project.entity';
import { ProjectId } from '../shared/entity-ids';

export interface IProjectRepository {
  findById(id: ProjectId): Promise<Project | null>;
  findByIds(ids: ProjectId[]): Promise<Project[]>;
  findAll(): Promise<Project[]>;
  count(): Promise<number>;
  findLastProjectNumber(): Promise<string | null>;
  save(project: Project): Promise<void>;
}
