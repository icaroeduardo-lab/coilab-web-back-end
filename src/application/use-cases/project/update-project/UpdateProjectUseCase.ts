import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  urlDocument?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<void> {
    const project = await this.projectRepository.findById(ProjectId(input.id));
    if (!project) {
      throw new Error(`Project not found: ${input.id}`);
    }

    if (input.name !== undefined) project.changeName(input.name);
    if (input.description !== undefined) project.changeDescription(input.description);
    if (input.urlDocument !== undefined) project.updateUrlDocument(input.urlDocument);

    await this.projectRepository.save(project);
  }
}
