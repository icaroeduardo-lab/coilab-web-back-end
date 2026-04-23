import { CreateProjectUseCase } from './CreateProjectUseCase';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project, ProjectStatus } from '../../../../domain/entities/project.entity';
import { ProjectOutput } from '../shared/project-output';

const makeRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findLastProjectNumber: jest.fn(),
  save: jest.fn(),
});

describe('CreateProjectUseCase', () => {
  it('creates project with status Backlog and generated number', async () => {
    const repo = makeRepo();
    repo.findLastProjectNumber.mockResolvedValue(null);
    const sut = new CreateProjectUseCase(repo);

    const output: ProjectOutput = await sut.execute({ name: 'CoiLab', description: 'Projeto principal' });

    const saved: Project = repo.save.mock.calls[0][0];
    expect(saved.getStatus()).toBe(ProjectStatus.BACKLOG);
    expect(saved.getName()).toBe('CoiLab');
    expect(saved.getProjectNumber()).toMatch(/^#\d{8}$/);
    expect(output.id).toBe(saved.getId());
    expect(output.name).toBe('CoiLab');
    expect(output.status).toBe(ProjectStatus.BACKLOG);
  });

  it('increments number from last registered', async () => {
    const year = new Date().getFullYear();
    const repo = makeRepo();
    repo.findLastProjectNumber.mockResolvedValue(`#${year}0002`);
    const sut = new CreateProjectUseCase(repo);

    const output = await sut.execute({ name: 'P2', description: 'D' });

    const saved: Project = repo.save.mock.calls[0][0];
    expect(saved.getProjectNumber()).toBe(`#${year}0003`);
    expect(output.projectNumber).toBe(`#${year}0003`);
  });
});
