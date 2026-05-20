import { SyncGitHubIssueStatusUseCase } from './SyncGitHubIssueStatusUseCase';
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
  findByGitHubIssueNumber: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
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

describe('SyncGitHubIssueStatusUseCase', () => {
  it('sets status=true and completionDate when action=closed', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findByGitHubIssueNumber.mockResolvedValue(task);
    const sut = new SyncGitHubIssueStatusUseCase(repo);

    await sut.execute({ issueNumber: 1, repository: 'front', action: 'closed' });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(true);
    expect(issues[0].completionDate).toBeDefined();
  });

  it('sets status=false and clears completionDate when action=reopened', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ status: true, completionDate: '2026-05-01T00:00:00.000Z' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findByGitHubIssueNumber.mockResolvedValue(task);
    const sut = new SyncGitHubIssueStatusUseCase(repo);

    await sut.execute({ issueNumber: 1, repository: 'front', action: 'reopened' });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(false);
    expect(issues[0].completionDate).toBeUndefined();
  });

  it('does nothing when task not found', async () => {
    const repo = makeRepo();
    repo.findByGitHubIssueNumber.mockResolvedValue(null);
    const sut = new SyncGitHubIssueStatusUseCase(repo);

    await sut.execute({ issueNumber: 99, repository: 'back', action: 'closed' });

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('does not save when issue not matched in subtask', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ githubNumber: 1, repository: 'front' });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findByGitHubIssueNumber.mockResolvedValue(task);
    const sut = new SyncGitHubIssueStatusUseCase(repo);

    await sut.execute({ issueNumber: 99, repository: 'front', action: 'closed' });

    expect(repo.save).not.toHaveBeenCalled();
  });
});
