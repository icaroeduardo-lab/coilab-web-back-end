import { randomUUID } from 'crypto';
import { PrismaProjectRepository } from '../PrismaProjectRepository';
import { Project, ProjectStatus } from '../../../../../domain/entities/project.entity';
import { ProjectId } from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const repo = new PrismaProjectRepository();

const makeProject = (overrides: Partial<{ number: string; status: ProjectStatus }> = {}) =>
  new Project({
    id: ProjectId(randomUUID()),
    name: 'Projeto Teste',
    projectNumber: overrides.number ?? '#20260001',
    description: 'Descrição',
    status: overrides.status ?? ProjectStatus.BACKLOG,
    createdAt: new Date(),
  });

beforeEach(truncateAll);

describe('PrismaProjectRepository', () => {
  it('saves and retrieves a project by id', async () => {
    const project = makeProject();
    await repo.save(project);

    const found = await repo.findById(project.getId());
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(project.getId());
    expect(found!.getName()).toBe('Projeto Teste');
    expect(found!.getStatus()).toBe(ProjectStatus.BACKLOG);
  });

  it('returns null for unknown id', async () => {
    const result = await repo.findById(ProjectId(randomUUID()));
    expect(result).toBeNull();
  });

  it('upsert updates existing project', async () => {
    const project = makeProject();
    await repo.save(project);
    project.changeName('Nome Atualizado');
    await repo.save(project);

    const found = await repo.findById(project.getId());
    expect(found!.getName()).toBe('Nome Atualizado');
  });

  it('findAll returns all projects', async () => {
    await repo.save(makeProject({ number: '#20260001' }));
    await repo.save(makeProject({ number: '#20260002' }));

    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });

  it('findLastProjectNumber returns highest number', async () => {
    await repo.save(makeProject({ number: '#20260001' }));
    await repo.save(makeProject({ number: '#20260002' }));

    const last = await repo.findLastProjectNumber();
    expect(last).toBe('#20260002');
  });

  it('findLastProjectNumber returns null when empty', async () => {
    const last = await repo.findLastProjectNumber();
    expect(last).toBeNull();
  });
});
