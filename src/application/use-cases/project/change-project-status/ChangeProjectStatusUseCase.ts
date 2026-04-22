import { ProjectStatus } from '../../../../domain/entities/project.entity';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';

export interface ChangeProjectStatusInput {
  id: string;
  status: ProjectStatus;
}

export class ChangeProjectStatusUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: ChangeProjectStatusInput): Promise<void> {
    const project = await this.projectRepository.findById(ProjectId(input.id));
    if (!project) {
      throw new Error(`Project not found: ${input.id}`);
    }

    project.updateStatus(input.status);

    await this.projectRepository.save(project);
  }
}
