import { Project } from '../../../../domain/entities/project.entity';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { generateNextNumber } from '../../../../domain/shared/sequential-number';
import { generateId } from '../../../../shared/generate-id';

export interface CreateProjectInput {
  name: string;
  description: string;
  urlDocument?: string;
}

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<void> {
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
  }
}
