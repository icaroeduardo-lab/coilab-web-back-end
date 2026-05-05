import { UpdateDiscoveryFormUseCase } from './UpdateDiscoveryFormUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  TaskToolId,
} from '../../../../domain/shared/entity-ids';
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

const makeSubTask = (id: string, typeId = 1) =>
  new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    typeId: TaskToolId(typeId),
    taskNumber: '#20260001',
    expectedDelivery: new Date(),
  });

const makeTask = (subTasks: SubTask[] = []) =>
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

describe('UpdateDiscoveryFormUseCase', () => {
  it('saves partial form fields into metadata', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const userId = randomUUID();
    const subTask = makeSubTask(subTaskId);
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
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    const form = updated.getMetadata().form as Record<string, { value: unknown }>;
    expect(form.projectName?.value).toBe('CoiLab');
    expect(form.summary?.value).toBe('Resumo');
    expect(form.complexity).toBeUndefined();
  });

  it('records userId and filledAt on each field', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const userId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    const before = new Date();
    await sut.execute({ taskId: task.getId(), subTaskId, userId, fields: { summary: 'Teste' } });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    const form = updated.getMetadata().form as Record<string, { value: unknown; userId: string; filledAt: string }>;
    expect(form.summary?.userId).toBe(userId);
    expect(new Date(form.summary?.filledAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('skips fields with undefined value', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const userId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateDiscoveryFormUseCase(repo);

    await sut.execute({
      taskId: task.getId(),
      subTaskId,
      userId,
      fields: { projectName: undefined, summary: 'Novo' },
    });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    const form = updated.getMetadata().form as Record<string, { value: unknown }>;
    expect(form.projectName).toBeUndefined();
    expect(form.summary?.value).toBe('Novo');
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
