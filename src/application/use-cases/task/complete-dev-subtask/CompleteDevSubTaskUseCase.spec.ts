import { CompleteDevSubTaskUseCase } from './CompleteDevSubTaskUseCase';
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
  title: 'Issue',
  url: 'https://github.com/org/repo/issues/1',
  githubNumber: 1,
  repository: 'front',
  flowId: 3,
  createdAt: new Date().toISOString(),
  status: false,
  ...overrides,
});

const makeDevSubTask = (id: string, issues: DevelopmentIssue[] = [], typeId = 4) =>
  new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    typeId: TaskToolId(typeId),
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

describe('CompleteDevSubTaskUseCase', () => {
  it('closes all open issues and completes subtask', async () => {
    const repo = makeRepo();
    const github = makeGitHub();
    const subTaskId = randomUUID();
    const issue1 = makeIssue({ githubNumber: 1 });
    const issue2 = makeIssue({ githubNumber: 2 });
    const task = makeTask([makeDevSubTask(subTaskId, [issue1, issue2])], COILAB_WEB_PROJECT_ID);
    repo.findById.mockResolvedValue(task);
    const sut = new CompleteDevSubTaskUseCase(repo, github);

    await sut.execute({ taskId: task.getId(), subTaskId });

    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks()[0];
    const issues = subTask.getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(true);
    expect(issues[0].completionDate).toBeDefined();
    expect(issues[1].status).toBe(true);
    expect(issues[1].completionDate).toBeDefined();
    expect(subTask.getStatus()).toBe(SubTaskStatus.AGUARDANDO_CHECKOUT);
  });

  it('calls GitHub updateIssue for each coilab-web open issue', async () => {
    const repo = makeRepo();
    const github = makeGitHub();
    const subTaskId = randomUUID();
    const issue = makeIssue({ githubNumber: 42, repository: 'back' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])], COILAB_WEB_PROJECT_ID);
    repo.findById.mockResolvedValue(task);
    const sut = new CompleteDevSubTaskUseCase(repo, github);

    await sut.execute({ taskId: task.getId(), subTaskId });

    expect(github.updateIssue).toHaveBeenCalledWith({
      repository: 'back',
      issueNumber: 42,
      state: 'closed',
    });
  });

  it('does not call GitHub for non-coilab-web project issues', async () => {
    const repo = makeRepo();
    const github = makeGitHub();
    const subTaskId = randomUUID();
    const issue = makeIssue({ githubNumber: undefined, repository: undefined, url: undefined });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new CompleteDevSubTaskUseCase(repo, github);

    await sut.execute({ taskId: task.getId(), subTaskId });

    expect(github.updateIssue).not.toHaveBeenCalled();
  });

  it('skips already-closed issues', async () => {
    const repo = makeRepo();
    const github = makeGitHub();
    const subTaskId = randomUUID();
    const closedIssue = makeIssue({ status: true, completionDate: '2026-01-01T00:00:00.000Z' });
    const openIssue = makeIssue({ githubNumber: 2 });
    const task = makeTask(
      [makeDevSubTask(subTaskId, [closedIssue, openIssue])],
      COILAB_WEB_PROJECT_ID,
    );
    repo.findById.mockResolvedValue(task);
    const sut = new CompleteDevSubTaskUseCase(repo, github);

    await sut.execute({ taskId: task.getId(), subTaskId });

    expect(github.updateIssue).toHaveBeenCalledTimes(1);
    expect(github.updateIssue).toHaveBeenCalledWith(expect.objectContaining({ issueNumber: 2 }));
  });

  it('throws when subtask is not typeId=4', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDevSubTask(subTaskId, [], 2)]);
    repo.findById.mockResolvedValue(task);
    const sut = new CompleteDevSubTaskUseCase(repo, makeGitHub());

    await expect(sut.execute({ taskId: task.getId(), subTaskId })).rejects.toThrow(
      'não é do tipo Desenvolvimento',
    );
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new CompleteDevSubTaskUseCase(repo, makeGitHub());

    await expect(sut.execute({ taskId: randomUUID(), subTaskId: randomUUID() })).rejects.toThrow(
      'Task not found',
    );
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new CompleteDevSubTaskUseCase(repo, makeGitHub());

    await expect(sut.execute({ taskId: task.getId(), subTaskId: randomUUID() })).rejects.toThrow(
      'SubTask not found',
    );
  });
});
