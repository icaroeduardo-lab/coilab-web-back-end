import { ChangeSubTaskStatusUseCase } from './ChangeSubTaskStatusUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import {
  DiscoverySubTask,
  DiagramSubTask,
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

const makeSubTask = (id: string, type = SubTaskType.DIAGRAM) => {
  if (type === SubTaskType.DISCOVERY) {
    return new DiscoverySubTask({
      id: SubTaskId(id),
      taskId: TaskId(randomUUID()),
      idUser: ApplicantId(randomUUID()),
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
    });
  }
  return new DiagramSubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: ApplicantId(randomUUID()),
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: new Date(),
  });
};

const makeTask = (subTasks: (DiscoverySubTask | DiagramSubTask)[] = []) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(randomUUID()),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(randomUUID()),
    subTasks,
  });

describe('ChangeSubTaskStatusUseCase', () => {
  it('start: transitions subtask to EM_PROGRESSO', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, action: 'start' });

    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
  });

  it('start: task moves to EM_EXECUCAO when subtask starts', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, action: 'start' });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('complete: transitions subtask to AGUARDANDO_CHECKOUT', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    subTask.start();
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, action: 'complete' });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    expect(updated.getStatus()).toBe(SubTaskStatus.AGUARDANDO_CHECKOUT);
  });

  it('approve: transitions subtask to APROVADO', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    subTask.start();
    subTask.complete();
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, action: 'approve' });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    expect(updated.getStatus()).toBe(SubTaskStatus.APROVADO);
  });

  it('reject: transitions subtask to REPROVADO', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    subTask.start();
    subTask.complete();
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, action: 'reject', reason: 'Inadequado' });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    expect(updated.getStatus()).toBe(SubTaskStatus.REPROVADO);
    expect(updated.getReason()).toBe('Inadequado');
  });

  it('cancel: transitions subtask to CANCELADO', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    subTask.start();
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, action: 'cancel', reason: 'Fora de escopo' });

    const saved: Task = repo.save.mock.calls[0][0];
    const updated = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    expect(updated.getStatus()).toBe(SubTaskStatus.CANCELADO);
  });

  it('reject: throws when reason missing', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const subTask = makeSubTask(subTaskId);
    subTask.start();
    subTask.complete();
    const task = makeTask([subTask]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await expect(sut.execute({ taskId: task.getId(), subTaskId, action: 'reject' })).rejects.toThrow(
      'reason is required',
    );
  });

  it('cancel: throws when reason missing', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await expect(sut.execute({ taskId: task.getId(), subTaskId, action: 'cancel' })).rejects.toThrow(
      'reason is required',
    );
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await expect(
      sut.execute({ taskId: randomUUID(), subTaskId: randomUUID(), action: 'start' }),
    ).rejects.toThrow('Task not found');
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new ChangeSubTaskStatusUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId: randomUUID(), action: 'start' }),
    ).rejects.toThrow('SubTask not found');
  });
});
