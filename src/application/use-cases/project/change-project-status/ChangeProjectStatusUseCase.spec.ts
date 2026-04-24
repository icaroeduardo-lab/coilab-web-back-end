import { ChangeProjectStatusUseCase } from './ChangeProjectStatusUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project, ProjectStatus } from '../../../../domain/entities/project.entity';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findLastProjectNumber: jest.fn(),
  findByIds: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
});

const makeProject = (id: string) =>
  new Project({
    id: ProjectId(id),
    name: 'Projeto',
    projectNumber: '#20260001',
    description: 'Desc',
  });

describe('ChangeProjectStatusUseCase', () => {
  it('changes project status', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeProject(id));
    const sut = new ChangeProjectStatusUseCase(repo);

    await sut.execute({ id, status: ProjectStatus.EM_EXECUCAO });

    const saved: Project = repo.save.mock.calls[0][0];
    expect(saved.getStatus()).toBe(ProjectStatus.EM_EXECUCAO);
  });

  it('throws when project not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new ChangeProjectStatusUseCase(repo);

    await expect(
      sut.execute({ id: randomUUID(), status: ProjectStatus.CONCLUIDO }),
    ).rejects.toThrow('Project not found');
  });
});
