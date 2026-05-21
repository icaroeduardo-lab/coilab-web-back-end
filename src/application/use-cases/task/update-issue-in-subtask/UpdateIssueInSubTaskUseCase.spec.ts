import { UpdateIssueInSubTaskUseCase } from './UpdateIssueInSubTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IGitHubService } from '../../../../domain/repositories/IGitHubService';
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
import { COILAB_WEB_PROJECT_ID } from '../../../../domain/shared/project-constants';
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  findLastSubTaskNumber: jest.fn(),
  findByGitHubIssueNumber: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeGitHub = (): jest.Mocked<IGitHubService> => ({
  createIssue: jest.fn(),
  updateIssue: jest.fn().mockResolvedValue(undefined),
});

const makeIssue = (overrides: Partial<DevelopmentIssue> = {}): DevelopmentIssue => ({
  id: randomUUID(),
  title: 'Issue original',
  url: 'https://github.com/icaroeduardo-lab/coilab-web/issues/1',
  githubNumber: 1,
  repository: 'front',
  flowId: 1,
  createdAt: new Date().toISOString(),
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

const makeTask = (subTasks: SubTask[] = [], projectId?: string) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(projectId ?? randomUUID()),
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
  it('updates title and body', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

    await sut.execute({
      taskId: task.getId(),
      subTaskId,
      issueId: issue.id,
      title: 'Título novo',
      body: 'Descrição atualizada',
    });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].title).toBe('Título novo');
    expect(issues[0].body).toBe('Descrição atualizada');
    expect(issues[0].status).toBe(false);
  });

  describe('non-coilab-web project', () => {
    it('sets status=true, auto-sets completionDate, stores sprint', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const issue = makeIssue({ repository: undefined, githubNumber: undefined });
      const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

      await sut.execute({
        taskId: task.getId(),
        subTaskId,
        issueId: issue.id,
        status: true,
        sprint: 'Sprint 2',
      });

      const saved: Task = repo.save.mock.calls[0][0];
      const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
      expect(issues[0].status).toBe(true);
      expect(issues[0].sprint).toBe('Sprint 2');
      expect(issues[0].completionDate).toBeDefined();
    });

    it('sets status=true when sprint already on issue', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const issue = makeIssue({
        repository: undefined,
        githubNumber: undefined,
        sprint: 'Sprint 1',
      });
      const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true });

      const saved: Task = repo.save.mock.calls[0][0];
      const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
      expect(issues[0].status).toBe(true);
      expect(issues[0].completionDate).toBeDefined();
    });

    it('throws when setting status=true without sprint', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const issue = makeIssue({ repository: undefined, githubNumber: undefined });
      const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

      await expect(
        sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true }),
      ).rejects.toThrow('sprint');
    });
  });

  describe('coilab-web project', () => {
    it('calls GitHub updateIssue when status changes to closed', async () => {
      const repo = makeRepo();
      const github = makeGitHub();
      const subTaskId = randomUUID();
      const issue = makeIssue();
      const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, github);

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true });

      expect(github.updateIssue).toHaveBeenCalledWith({
        repository: 'front',
        issueNumber: 1,
        state: 'closed',
      });
    });

    it('calls GitHub updateIssue when title and body change', async () => {
      const repo = makeRepo();
      const github = makeGitHub();
      const subTaskId = randomUUID();
      const issue = makeIssue();
      const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, github);

      await sut.execute({
        taskId: task.getId(),
        subTaskId,
        issueId: issue.id,
        title: 'Novo título',
        body: 'Nova descrição',
      });

      expect(github.updateIssue).toHaveBeenCalledWith({
        repository: 'front',
        issueNumber: 1,
        title: 'Novo título',
        body: 'Nova descrição',
      });
    });

    it('does not call GitHub when only non-GitHub fields change', async () => {
      const repo = makeRepo();
      const github = makeGitHub();
      const subTaskId = randomUUID();
      const issue = makeIssue();
      const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, github);

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, flowId: 2 });

      expect(github.updateIssue).not.toHaveBeenCalled();
    });
  });

  it('throws when editing closed issue (any field)', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ status: true, sprint: 'Sprint 1', completionDate: '2026-12-31' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, title: 'Novo título' }),
    ).rejects.toThrow('Issue concluída não pode ser editada');
  });

  it('throws when trying to reopen closed issue via API', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ status: true, completionDate: '2026-05-01T00:00:00.000Z' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: false }),
    ).rejects.toThrow('Issue concluída não pode ser editada');
  });

  it('throws when issue not found', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDevSubTask(subTaskId, [makeIssue()])]);
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: randomUUID(), title: 'x' }),
    ).rejects.toThrow('Issue não encontrada');
  });
});
