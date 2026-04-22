import { ListProjectsUseCase } from './ListProjectsUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project } from '../../../../domain/entities/project.entity';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findLastProjectNumber: jest.fn(),
  save: jest.fn(),
});

const makeProject = (id: string) =>
  new Project({
    id: ProjectId(id),
    name: 'P',
    projectNumber: '#20260001',
    description: 'D',
    urlDocument: 'https://doc.example.com',
  });

describe('ListProjectsUseCase', () => {
  it('returns all projects without urlDocument', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([makeProject(randomUUID()), makeProject(randomUUID())]);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).not.toHaveProperty('urlDocument');
  });

  it('returns empty array when no projects exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute();

    expect(result).toEqual([]);
  });
});
