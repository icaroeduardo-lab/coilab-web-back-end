import { GetTaskUseCase } from './GetTaskUseCase';
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

const makeTask = (creatorId: string) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(randomUUID()),
    name: 'Task 1',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(creatorId),
  });

const makeUser = (id: string) =>
  new User({ id: UserId(id), name: 'John Doe', imageUrl: 'https://img.example.com/avatar.png' });

describe('GetTaskUseCase', () => {
  it('returns task with creator data', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const creatorId = randomUUID();
    taskRepo.findById.mockResolvedValue(makeTask(creatorId));
    userRepo.findById.mockResolvedValue(makeUser(creatorId));
    const sut = new GetTaskUseCase(taskRepo, userRepo);

    const result = await sut.execute({ id: randomUUID() });

    expect(result.name).toBe('Task 1');
    expect(result.creator?.name).toBe('John Doe');
    expect(result.creator?.imageUrl).toBe('https://img.example.com/avatar.png');
  });

  it('throws when creator not found', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    taskRepo.findById.mockResolvedValue(makeTask(randomUUID()));
    userRepo.findById.mockResolvedValue(null);
    const sut = new GetTaskUseCase(taskRepo, userRepo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Creator not found');
  });

  it('throws when task not found', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    taskRepo.findById.mockResolvedValue(null);
    const sut = new GetTaskUseCase(taskRepo, userRepo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Task not found');
  });
});
