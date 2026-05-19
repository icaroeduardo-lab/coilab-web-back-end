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
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeGitHub = (): jest.Mocked<IGitHubService> => ({
  createIssue: jest.fn(),
  updateIssueState: jest.fn().mockResolvedValue(undefined),
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
    it('sets status=true when sprint and completionDate in payload', async () => {
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
      const issue = makeIssue({
        repository: undefined,
        githubNumber: undefined,
        sprint: 'Sprint 1',
        completionDate: '2026-11-30',
      });
      const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true });

      const saved: Task = repo.save.mock.calls[0][0];
      const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
      expect(issues[0].status).toBe(true);
    });

    it('throws when setting status=true without sprint or completionDate', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const issue = makeIssue({ repository: undefined, githubNumber: undefined });
      const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, makeGitHub());

      await expect(
        sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true }),
      ).rejects.toThrow('sprint e completionDate');
    });
  });

  describe('coilab-web project', () => {
    it('calls GitHub updateIssueState when status changes to closed', async () => {
      const repo = makeRepo();
      const github = makeGitHub();
      const subTaskId = randomUUID();
      const issue = makeIssue();
      const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, github);

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: true });

      expect(github.updateIssueState).toHaveBeenCalledWith({
        repository: 'front',
        issueNumber: 1,
        state: 'closed',
      });
    });

    it('calls GitHub updateIssueState when status changes to open', async () => {
      const repo = makeRepo();
      const github = makeGitHub();
      const subTaskId = randomUUID();
      const issue = makeIssue({ status: true });
      const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, github);

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, status: false });

      expect(github.updateIssueState).toHaveBeenCalledWith({
        repository: 'front',
        issueNumber: 1,
        state: 'open',
      });
    });

    it('does not call GitHub when status is not changed', async () => {
      const repo = makeRepo();
      const github = makeGitHub();
      const subTaskId = randomUUID();
      const issue = makeIssue();
      const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new UpdateIssueInSubTaskUseCase(repo, github);

      await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id, title: 'Novo' });

      expect(github.updateIssueState).not.toHaveBeenCalled();
    });
  });

  it('throws when editing issue with status=true', async () => {
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
