import { AddSubTaskToTaskUseCase } from './AddSubTaskToTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  findLastSubTaskNumber: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeTask = (id: string) =>
  new Task({
    id: TaskId(id),
    projectId: ProjectId(randomUUID()),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(1),
    creatorId: UserId(randomUUID()),
  });

describe('AddSubTaskToTaskUseCase', () => {
  it('adds discovery subtask to task', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    repo.findById.mockResolvedValue(makeTask(taskId));
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({
      taskId,
      typeId: 1,
      idUser: randomUUID(),
      expectedDelivery: new Date('2026-12-31'),
    });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()).toHaveLength(1);
    expect(saved.getSubTasks()[0].getTypeId()).toBe(1);
  });

  it('adds design subtask to task', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    repo.findById.mockResolvedValue(makeTask(taskId));
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({
      taskId,
      typeId: 2,
      idUser: randomUUID(),
      expectedDelivery: new Date('2026-12-31'),
    });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()[0].getTypeId()).toBe(2);
  });

  it('adds diagram subtask to task', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    repo.findById.mockResolvedValue(makeTask(taskId));
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({
      taskId,
      typeId: 3,
      idUser: randomUUID(),
      expectedDelivery: new Date('2026-12-31'),
    });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()[0].getTypeId()).toBe(3);
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddSubTaskToTaskUseCase(repo);

    await expect(
      sut.execute({
        taskId: randomUUID(),
        typeId: 2,
        idUser: randomUUID(),
        expectedDelivery: new Date(),
      }),
    ).rejects.toThrow('Task not found');
  });

  it('throws when adding duplicate subtask type that is not REPROVADO', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    const task = makeTask(taskId);
    repo.findById.mockResolvedValue(task);
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({
      taskId,
      typeId: 2,
      idUser: randomUUID(),
      expectedDelivery: new Date(),
    });

    const taskWithSubTask = repo.save.mock.calls[0][0] as Task;
    repo.findById.mockResolvedValue(taskWithSubTask);

    await expect(
      sut.execute({
        taskId,
        typeId: 2,
        idUser: randomUUID(),
        expectedDelivery: new Date(),
      }),
    ).rejects.toThrow();
  });
});
