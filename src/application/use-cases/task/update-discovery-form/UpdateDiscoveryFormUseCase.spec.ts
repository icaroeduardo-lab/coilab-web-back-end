import { UpdateDiscoveryFormUseCase } from './UpdateDiscoveryFormUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import {
  DiscoverySubTask,
  DesignSubTask,
  SubTaskStatus,
  Level,
  Frequency,
} from '../../../../domain/entities/sub-task.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
} from '../../../../domain/shared/entity-ids';
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

const makeDiscoverySubTask = (id: string) =>
  new DiscoverySubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    expectedDelivery: new Date(),
  });

const makeDesignSubTask = (id: string) =>
  new DesignSubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    expectedDelivery: new Date(),
  });

const makeTask = (subTasks: (DiscoverySubTask | DesignSubTask)[] = []) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(randomUUID()),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.EM_EXECUCAO,
    applicantId: ApplicantId(1),
    creatorId: UserId(randomUUID()),
    subTasks,
  });

const allFields = {
  complexity: Level.HIGH,
  projectName: 'CoiLab',
  summary: 'Resumo',
  painPoints: 'Dor',
  frequency: Frequency.DAILY,
  currentProcess: 'Processo atual',
  inactionCost: 'Custo',
  volume: '100',
  avgTime: '2h',
  humanDependency: Level.MEDIUM,
  rework: 'Retrabalho',
  previousAttempts: 'Nenhuma',
  benchmark: 'Referência',
  institutionalPriority: Level.HIGH,
  technicalOpinion: 'Ok',
};

describe('UpdateDiscoveryFormUseCase', () => {
  it('saves partial form fields', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const userId = randomUUID();
    const subTask = makeDiscoverySubTask(subTaskId);
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    await sut.execute({
      taskId: task.getId(),
      subTaskId,
      userId,
      fields: { projectName: 'CoiLab', summary: 'Resumo' },
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId) as DiscoverySubTask;
    expect(updated.getForm().projectName?.value).toBe('CoiLab');
    expect(updated.getForm().summary?.value).toBe('Resumo');
    expect(updated.getForm().complexity).toBeUndefined();
  });

  it('records userId and filledAt on each field', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const userId = randomUUID();
    const subTask = makeDiscoverySubTask(subTaskId);
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    const before = new Date();
    await sut.execute({ taskId: task.getId(), subTaskId, userId, fields: { summary: 'Teste' } });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId) as DiscoverySubTask;
    expect(updated.getForm().summary?.userId).toBe(userId);
    expect(updated.getForm().summary?.filledAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('all fields filled allows complete()', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const userId = randomUUID();
    const subTask = makeDiscoverySubTask(subTaskId);
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, userId, fields: allFields });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId) as DiscoverySubTask;
    expect(() => updated.complete()).not.toThrow();
  });

  it('throws when subtask type is not Discovery', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDesignSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    await expect(
      sut.execute({
        taskId: task.getId(),
        subTaskId,
        userId: randomUUID(),
        fields: { summary: 'X' },
      }),
    ).rejects.toThrow('SubTask is not a Discovery type');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    await expect(
      sut.execute({
        taskId: randomUUID(),
        subTaskId: randomUUID(),
        userId: randomUUID(),
        fields: {},
      }),
    ).rejects.toThrow('Task not found');
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    await expect(
      sut.execute({
        taskId: task.getId(),
        subTaskId: randomUUID(),
        userId: randomUUID(),
        fields: {},
      }),
    ).rejects.toThrow('SubTask not found');
  });
});
