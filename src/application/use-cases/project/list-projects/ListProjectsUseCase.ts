import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectListOutput } from '../shared/project-output';

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(): Promise<ProjectListOutput[]> {
    const projects = await this.projectRepository.findAll();

    return projects.map((project) => ({
      id: project.getId(),
      projectNumber: project.getProjectNumber(),
      name: project.getName(),
      description: project.getDescription(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
    }));
  }
}
