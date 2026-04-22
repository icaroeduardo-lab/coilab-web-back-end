import { Project } from '../../../../domain/entities/project.entity';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';

export interface GetProjectInput {
  id: string;
}

export class GetProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: GetProjectInput): Promise<Project> {
    const project = await this.projectRepository.findById(ProjectId(input.id));
    if (!project) {
      throw new Error(`Project not found: ${input.id}`);
    }
    return project;
  }
}
