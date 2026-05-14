import { GetProjectUseCase } from './GetProjectUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project } from '../../../../domain/entities/project.entity';
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
    name: 'P',
    projectNumber: '#20260001',
    description: 'D',
    canvas: { problem: 'Problema X' },
  });

describe('GetProjectUseCase', () => {
  it('returns project output with canvas', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeProject(id));
    const sut = new GetProjectUseCase(repo);

    const result = await sut.execute({ id });

    expect(result.id).toBe(id);
    expect(result.canvas?.problem).toBe('Problema X');
  });

  it('throws when project not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new GetProjectUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Project not found');
  });

  it('throws on invalid UUID', async () => {
    const repo = makeRepo();
    const sut = new GetProjectUseCase(repo);

    await expect(sut.execute({ id: 'not-a-uuid' })).rejects.toThrow();
  });
});
