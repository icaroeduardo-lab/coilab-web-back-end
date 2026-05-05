import { DeleteTaskUseCase } from './DeleteTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import { SubTaskId, TaskToolId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
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

describe('DeleteTaskUseCase', () => {
  it('deletes task with no subtasks', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new DeleteTaskUseCase(repo);

    await sut.execute({ id });

    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  it('blocks deletion when subtask is active', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    const task = makeTask(id);
    const subtask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(id),
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(1),
      expectedDelivery: new Date(),
    });
    task.addSubTask(subtask);
    repo.findById.mockResolvedValue(task);
    const sut = new DeleteTaskUseCase(repo);

    await expect(sut.execute({ id })).rejects.toThrow('subtasks ativas');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new DeleteTaskUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Task not found');
  });
});
