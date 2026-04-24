import { ListProjectsUseCase } from './ListProjectsUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project } from '../../../../domain/entities/project.entity';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findLastProjectNumber: jest.fn(),
  save: jest.fn(),
});

const makeProject = (id: string) =>
  new Project({ id: ProjectId(id), name: 'P', projectNumber: '#20260001', description: 'D', urlDocument: 'https://doc.example.com' });

describe('ListProjectsUseCase', () => {
  it('returns paginated projects without urlDocument', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([makeProject(randomUUID()), makeProject(randomUUID())]);
    repo.count.mockResolvedValue(2);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute();

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).not.toHaveProperty('urlDocument');
  });

  it('returns empty when no projects exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    repo.count.mockResolvedValue(0);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('respects page and limit', async () => {
    const repo = makeRepo();
    const projects = Array.from({ length: 5 }, () => makeProject(randomUUID()));
    repo.findAll.mockResolvedValue(projects);
    repo.count.mockResolvedValue(5);
    const sut = new ListProjectsUseCase(repo);

    const result = await sut.execute({ page: 2, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
  });
});
