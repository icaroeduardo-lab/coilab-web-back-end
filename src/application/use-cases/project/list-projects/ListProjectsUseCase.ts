import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import {
  PaginationInput,
  PaginatedOutput,
  toPagination,
} from '../../../../domain/shared/pagination';
import { ProjectListOutput } from '../shared/project-output';

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input?: Partial<PaginationInput>): Promise<PaginatedOutput<ProjectListOutput>> {
    const { page, limit } = toPagination(input?.page, input?.limit);

    const [projects, total] = await Promise.all([
      this.projectRepository.findAll(),
      this.projectRepository.count(),
    ]);

    const sliced = projects.slice((page - 1) * limit, page * limit);

    const data = sliced.map((project) => ({
      id: project.getId(),
      projectNumber: project.getProjectNumber(),
      name: project.getName(),
      description: project.getDescription(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
    }));

    return { data, total, page, limit };
  }
}
