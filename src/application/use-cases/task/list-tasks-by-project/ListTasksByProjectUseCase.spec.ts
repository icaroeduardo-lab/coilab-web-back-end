import { ListTasksByProjectUseCase } from './ListTasksByProjectUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeTaskRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  count: jest.fn(),
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
  it('returns slim task list for project', async () => {
    const taskRepo = makeTaskRepo();
    const projectId = randomUUID();
    taskRepo.findByProjectId.mockResolvedValue([makeTask(projectId), makeTask(projectId)]);
    const sut = new ListTasksByProjectUseCase(taskRepo);

    const result = await sut.execute({ projectId });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('taskNumber');
    expect(result[0]).not.toHaveProperty('description');
    expect(result[0]).not.toHaveProperty('creator');
  });

  it('returns empty when no tasks', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findByProjectId.mockResolvedValue([]);
    const sut = new ListTasksByProjectUseCase(taskRepo);

    const result = await sut.execute({ projectId: randomUUID() });

    expect(result).toEqual([]);
  });
});
