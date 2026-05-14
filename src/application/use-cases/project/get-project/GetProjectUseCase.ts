import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { ProjectOutput } from '../shared/project-output';

export interface GetProjectInput {
  id: string;
}

export class GetProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: GetProjectInput): Promise<ProjectOutput> {
    const project = await this.projectRepository.findById(ProjectId(input.id));
    if (!project) {
      throw new Error(`Project not found: ${input.id}`);
    }

    return {
      id: project.getId(),
      projectNumber: project.getProjectNumber(),
      name: project.getName(),
      description: project.getDescription(),
      canvas: project.getCanvas(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
    };
  }
}
