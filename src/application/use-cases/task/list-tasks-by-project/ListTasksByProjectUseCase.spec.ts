import { ListTasksByProjectUseCase } from './ListTasksByProjectUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeTask = (projectId: string) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(projectId),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(randomUUID()),
  });

describe('ListTasksByProjectUseCase', () => {
  it('returns tasks for project', async () => {
    const repo = makeRepo();
    const projectId = randomUUID();
    repo.findByProjectId.mockResolvedValue([makeTask(projectId), makeTask(projectId)]);
    const sut = new ListTasksByProjectUseCase(repo);

    const result = await sut.execute({ projectId });

    expect(result).toHaveLength(2);
    expect(repo.findByProjectId).toHaveBeenCalledTimes(1);
  });

  it('returns empty when no tasks', async () => {
    const repo = makeRepo();
    repo.findByProjectId.mockResolvedValue([]);
    const sut = new ListTasksByProjectUseCase(repo);

    const result = await sut.execute({ projectId: randomUUID() });

    expect(result).toEqual([]);
  });
});
