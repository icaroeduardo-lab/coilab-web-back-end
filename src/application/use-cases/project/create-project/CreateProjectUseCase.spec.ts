import { CreateProjectUseCase } from './CreateProjectUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project, ProjectStatus } from '../../../../domain/entities/project.entity';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});

describe('CreateProjectUseCase', () => {
  it('creates and saves project with default status backlog', async () => {
    const repo = makeRepo();
    const sut = new CreateProjectUseCase(repo);

    await sut.execute({
      id: randomUUID(),
      name: 'CoiLab',
      projectNumber: 'PRJ-001',
      description: 'Projeto principal',
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved: Project = repo.save.mock.calls[0][0];
    expect(saved.getStatus()).toBe(ProjectStatus.BACKLOG);
    expect(saved.getName()).toBe('CoiLab');
  });

  it('throws on invalid UUID', async () => {
    const repo = makeRepo();
    const sut = new CreateProjectUseCase(repo);

    await expect(
      sut.execute({ id: 'not-a-uuid', name: 'X', projectNumber: 'P-1', description: 'D' }),
    ).rejects.toThrow();
  });
});
