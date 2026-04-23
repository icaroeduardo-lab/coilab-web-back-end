import { Project } from '../../../../domain/entities/project.entity';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { generateNextNumber } from '../../../../domain/shared/sequential-number';
import { generateId } from '../../../../shared/generate-id';
import { ProjectOutput } from '../shared/project-output';

export interface CreateProjectInput {
  name: string;
  description: string;
  urlDocument?: string;
}

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<ProjectOutput> {
    const lastNumber = await this.projectRepository.findLastProjectNumber();
    const projectNumber = generateNextNumber(lastNumber);

    const project = new Project({
      id: ProjectId(generateId()),
      name: input.name,
      projectNumber,
      description: input.description,
      urlDocument: input.urlDocument,
    });

    await this.projectRepository.save(project);

    return {
      id: project.getId(),
      projectNumber: project.getProjectNumber(),
      name: project.getName(),
      description: project.getDescription(),
      urlDocument: project.getUrlDocument(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
    };
  }
}
