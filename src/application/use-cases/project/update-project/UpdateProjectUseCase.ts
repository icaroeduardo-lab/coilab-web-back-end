import { Canvas } from '../../../../domain/entities/project.entity';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  canvas?: Canvas;
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
    if (input.canvas !== undefined) project.updateCanvas(input.canvas);

    await this.projectRepository.save(project);
  }
}
