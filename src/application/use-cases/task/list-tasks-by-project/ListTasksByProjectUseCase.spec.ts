import { ListTasksByProjectUseCase } from './ListTasksByProjectUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { User } from '../../../../domain/entities/user.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeTaskRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeUserRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  save: jest.fn(),
});

const makeTask = (projectId: string, creatorId: string) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(projectId),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(creatorId),
  });

const makeUser = (id: string) =>
  new User({ id: UserId(id), name: 'Jane Doe', imageUrl: undefined });

describe('ListTasksByProjectUseCase', () => {
  it('returns tasks with creator data', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const projectId = randomUUID();
    const creatorId = randomUUID();
    taskRepo.findByProjectId.mockResolvedValue([
      makeTask(projectId, creatorId),
      makeTask(projectId, creatorId),
    ]);
    userRepo.findById.mockResolvedValue(makeUser(creatorId));
    const sut = new ListTasksByProjectUseCase(taskRepo, userRepo);

    const result = await sut.execute({ projectId });

    expect(result).toHaveLength(2);
    expect(result[0].creator?.name).toBe('Jane Doe');
  });

  it('throws when creator not found', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const projectId = randomUUID();
    taskRepo.findByProjectId.mockResolvedValue([makeTask(projectId, randomUUID())]);
    userRepo.findById.mockResolvedValue(null);
    const sut = new ListTasksByProjectUseCase(taskRepo, userRepo);

    await expect(sut.execute({ projectId })).rejects.toThrow('Creator not found');
  });

  it('returns empty when no tasks', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    taskRepo.findByProjectId.mockResolvedValue([]);
    const sut = new ListTasksByProjectUseCase(taskRepo, userRepo);

    const result = await sut.execute({ projectId: randomUUID() });

    expect(result).toEqual([]);
  });
});
