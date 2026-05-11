import { UpdateIssueInSubTaskUseCase } from './UpdateIssueInSubTaskUseCase';
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
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';
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

const makeIssue = (overrides: Partial<DevelopmentIssue> = {}): DevelopmentIssue => ({
  id: randomUUID(),
  title: 'Issue original',
  url: 'https://github.com/org/repo/issues/1',
  flowId: 1,
  status: false,
  ...overrides,
});

const makeDevSubTask = (id: string, issues: DevelopmentIssue[] = []) =>
  new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    typeId: TaskToolId(4),
    taskNumber: '#20260001',
    expectedDelivery: new Date(),
    metadata: { issues },
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

describe('UpdateIssueInSubTaskUseCase', () => {
  it('updates title and url', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await sut.execute({
      taskId: task.getId(),
      subTaskId,
      issueId: issue.id,
      title: 'Título novo',
      url: 'https://github.com/org/repo/issues/99',
    });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].title).toBe('Título novo');
    expect(issues[0].url).toBe('https://github.com/org/repo/issues/99');
    expect(issues[0].status).toBe(false);
  });

  it('sets status=true when sprint and completionDate in payload', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await sut.execute({
      taskId: task.getId(),
      subTaskId,
      issueId: issue.id,
      status: true,
      sprint: 'Sprint 2',
      completionDate: '2026-12-31',
    });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(true);
    expect(issues[0].sprint).toBe('Sprint 2');
  });

  it('sets status=true when sprint and completionDate already on issue', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ sprint: 'Sprint 1', completionDate: '2026-11-30' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(true);
  });

  it('throws when setting status=true without sprint or completionDate', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true }),
    ).rejects.toThrow('sprint e completionDate');
  });

  it('throws when setting status=true with only sprint (missing completionDate)', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await expect(
      sut.execute({
        taskId: task.getId(),
        subTaskId,
        issueId: issue.id,
        status: true,
        sprint: 'Sprint 1',
      }),
    ).rejects.toThrow('sprint e completionDate');
  });

  it('throws when editing issue with status=true', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ status: true, sprint: 'Sprint 1', completionDate: '2026-12-31' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, title: 'Novo título' }),
    ).rejects.toThrow('Issue concluída não pode ser editada');
  });

  it('throws when issue not found', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDevSubTask(subTaskId, [makeIssue()])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: randomUUID(), title: 'x' }),
    ).rejects.toThrow('Issue não encontrada');
  });
});
