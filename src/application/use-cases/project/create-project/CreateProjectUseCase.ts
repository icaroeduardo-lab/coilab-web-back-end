import { Project } from '../../../../domain/entities/project.entity';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';

export interface CreateProjectInput {
  id: string;
  name: string;
  projectNumber: string;
  description: string;
  urlDocument?: string;
}

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<void> {
    const project = new Project({
      id: ProjectId(input.id),
      name: input.name,
      projectNumber: input.projectNumber,
      description: input.description,
      urlDocument: input.urlDocument,
    });

    await this.projectRepository.save(project);
  }
}
