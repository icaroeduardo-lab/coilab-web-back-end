import { AddSubTaskToTaskUseCase } from './AddSubTaskToTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTaskType } from '../../../../domain/entities/sub-task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
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
    applicantId: ApplicantId(randomUUID()),
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
      type: SubTaskType.DISCOVERY,
      idUser: randomUUID(),
      expectedDelivery: new Date('2026-12-31'),
    });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()).toHaveLength(1);
    expect(saved.getSubTasks()[0].getType()).toBe(SubTaskType.DISCOVERY);
  });

  it('adds design subtask to task', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    repo.findById.mockResolvedValue(makeTask(taskId));
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({
      taskId,
      type: SubTaskType.DESIGN,
      idUser: randomUUID(),
      expectedDelivery: new Date('2026-12-31'),
    });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()[0].getType()).toBe(SubTaskType.DESIGN);
  });

  it('adds diagram subtask to task', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    repo.findById.mockResolvedValue(makeTask(taskId));
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({
      taskId,
      type: SubTaskType.DIAGRAM,
      idUser: randomUUID(),
      expectedDelivery: new Date('2026-12-31'),
    });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()[0].getType()).toBe(SubTaskType.DIAGRAM);
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddSubTaskToTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: randomUUID(), type: SubTaskType.DESIGN, idUser: randomUUID(), expectedDelivery: new Date() }),
    ).rejects.toThrow('Task not found');
  });

  it('throws when adding duplicate subtask type that is not REPROVADO', async () => {
    const repo = makeRepo();
    const taskId = randomUUID();
    const task = makeTask(taskId);
    repo.findById.mockResolvedValue(task);
    const sut = new AddSubTaskToTaskUseCase(repo);

    await sut.execute({ taskId, type: SubTaskType.DESIGN, idUser: randomUUID(), expectedDelivery: new Date() });

    const taskWithSubTask = repo.save.mock.calls[0][0] as Task;
    repo.findById.mockResolvedValue(taskWithSubTask);

    await expect(
      sut.execute({ taskId, type: SubTaskType.DESIGN, idUser: randomUUID(), expectedDelivery: new Date() }),
    ).rejects.toThrow();
  });
});
