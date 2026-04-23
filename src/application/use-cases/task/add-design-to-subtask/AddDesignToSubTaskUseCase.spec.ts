import { AddDesignToSubTaskUseCase } from './AddDesignToSubTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import {
  DesignSubTask,
  DiscoverySubTask,
  SubTaskStatus,
  SubTaskType,
} from '../../../../domain/entities/sub-task.entity';
import { TaskId, ProjectId, ApplicantId, UserId, SubTaskId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeDesignSubTask = (id: string) =>
  new DesignSubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: ApplicantId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    expectedDelivery: new Date(),
  });

const makeDiscoverySubTask = (id: string) =>
  new DiscoverySubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: ApplicantId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    expectedDelivery: new Date(),
  });

const makeTask = (subTasks: (DesignSubTask | DiscoverySubTask)[] = []) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(randomUUID()),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.EM_EXECUCAO,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(randomUUID()),
    subTasks,
  });

const validInput = (taskId: string, subTaskId: string) => ({
  taskId,
  subTaskId,
  userId: randomUUID(),
  title: 'Tela inicial',
  description: 'Layout da home',
  urlImage: 'https://example.com/image.png',
});

describe('AddDesignToSubTaskUseCase', () => {
  it('adds design to subtask', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDesignSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddDesignToSubTaskUseCase(repo);

    await sut.execute(validInput(task.getId(), subTaskId));

    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks().find((s) => s.getId() === subTaskId) as DesignSubTask;
    expect(subTask.getDesigns()).toHaveLength(1);
    expect(subTask.getDesigns()[0].getTitle()).toBe('Tela inicial');
    expect(subTask.getDesigns()[0].getUrlImage()).toBe('https://example.com/image.png');
  });

  it('throws when subtask type is not Design', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDiscoverySubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddDesignToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(task.getId(), subTaskId))).rejects.toThrow(
      'SubTask is not a Design type',
    );
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddDesignToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(randomUUID(), randomUUID()))).rejects.toThrow('Task not found');
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddDesignToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(task.getId(), randomUUID()))).rejects.toThrow('SubTask not found');
  });
});
