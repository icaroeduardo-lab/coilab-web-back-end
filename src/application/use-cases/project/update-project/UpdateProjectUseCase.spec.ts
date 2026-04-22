import { UpdateProjectUseCase } from './UpdateProjectUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project } from '../../../../domain/entities/project.entity';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});

const makeProject = (id: string) =>
  new Project({
    id: ProjectId(id),
    name: 'Original',
    projectNumber: 'PRJ-001',
    description: 'Desc original',
  });

describe('UpdateProjectUseCase', () => {
  it('updates name and description', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeProject(id));
    const sut = new UpdateProjectUseCase(repo);

    await sut.execute({ id, name: 'Novo nome', description: 'Nova desc' });

    const saved: Project = repo.save.mock.calls[0][0];
    expect(saved.getName()).toBe('Novo nome');
    expect(saved.getDescription()).toBe('Nova desc');
  });

  it('throws when project not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new UpdateProjectUseCase(repo);

    await expect(sut.execute({ id: randomUUID(), name: 'X' })).rejects.toThrow('Project not found');
  });

  it('skips undefined fields', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeProject(id));
    const sut = new UpdateProjectUseCase(repo);

    await sut.execute({ id, name: 'Apenas nome' });

    const saved: Project = repo.save.mock.calls[0][0];
    expect(saved.getDescription()).toBe('Desc original');
  });
});
