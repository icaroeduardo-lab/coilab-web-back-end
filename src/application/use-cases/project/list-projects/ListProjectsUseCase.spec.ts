import { ListProjectsUseCase } from './ListProjectsUseCase';
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
  new Project({ id: ProjectId(id), name: 'P', projectNumber: 'N', description: 'D' });

describe('ListProjectsUseCase', () => {
  it('returns all projects from repository', async () => {
    const repo = makeRepo();
    const projects = [makeProject(randomUUID()), makeProject(randomUUID())];
    repo.findAll.mockResolvedValue(projects);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledTimes(1);
  });

  it('returns empty array when no projects exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute();

    expect(result).toEqual([]);
  });
});
