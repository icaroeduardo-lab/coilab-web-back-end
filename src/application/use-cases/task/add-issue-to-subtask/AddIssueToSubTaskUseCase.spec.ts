import { AddIssueToSubTaskUseCase, DevelopmentIssue } from './AddIssueToSubTaskUseCase';
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

const makeSubTask = (id: string, typeId = 4, status = SubTaskStatus.EM_PROGRESSO) =>
  new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status,
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

const validInput = (taskId: string, subTaskId: string) => ({
  taskId,
  subTaskId,
  title: 'Criar endpoint de auth',
  url: 'https://github.com/org/repo/issues/1',
  flowId: 1,
});

describe('AddIssueToSubTaskUseCase', () => {
  it('adds issue to development subtask metadata', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo);

    const result = await sut.execute(validInput(task.getId(), subTaskId));

    expect(result.id).toBeDefined();
    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    const issues = subTask.getMetadata().issues as DevelopmentIssue[];
    expect(issues).toHaveLength(1);
    expect(issues[0].title).toBe('Criar endpoint de auth');
    expect(issues[0].url).toBe('https://github.com/org/repo/issues/1');
    expect(issues[0].flowId).toBe(1);
    expect(issues[0].status).toBe(false);
  });

  it('sets status=false by default', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo);

    await sut.execute(validInput(task.getId(), subTaskId));

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(false);
  });

  it('adds multiple issues independently', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo);

    await sut.execute(validInput(task.getId(), subTaskId));
    repo.findById.mockResolvedValue(repo.save.mock.calls[0][0]);
    await sut.execute({ ...validInput(task.getId(), subTaskId), title: 'Segunda issue' });

    const saved: Task = repo.save.mock.calls[1][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues).toHaveLength(2);
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddIssueToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(randomUUID(), randomUUID()))).rejects.toThrow(
      'Task not found',
    );
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(task.getId(), randomUUID()))).rejects.toThrow(
      'SubTask not found',
    );
  });

  it('throws when subtask is not typeId=4', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId, 2)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(task.getId(), subTaskId))).rejects.toThrow(
      'não é do tipo Desenvolvimento',
    );
  });

  it('throws when subtask is CANCELADO', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId, 4, SubTaskStatus.EM_PROGRESSO)]);
    task.getSubTasks()[0].cancel('motivo');
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(task.getId(), subTaskId))).rejects.toThrow();
  });
});
