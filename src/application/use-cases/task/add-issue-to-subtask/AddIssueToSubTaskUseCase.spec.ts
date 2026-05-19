import { AddIssueToSubTaskUseCase, DevelopmentIssue } from './AddIssueToSubTaskUseCase';
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
import { randomUUID } from 'crypto';

const MOCK_GITHUB_URL = 'https://github.com/icaroeduardo-lab/coilab-web/issues/1';

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
  createIssue: jest.fn().mockResolvedValue({ url: MOCK_GITHUB_URL, number: 1 }),
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

const coilabWebInput = (taskId: string, subTaskId: string) => ({
  taskId,
  subTaskId,
  title: 'Criar endpoint de auth',
  repository: 'front' as const,
});

const otherProjectInput = (taskId: string, subTaskId: string) => ({
  taskId,
  subTaskId,
  title: 'Criar endpoint de auth',
  flowId: 1,
  sprint: 'Sprint 3',
});

describe('AddIssueToSubTaskUseCase', () => {
  describe('coilab-web project', () => {
    it('creates GitHub issue and stores url in metadata with flowId=3', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const task = makeTask([makeSubTask(subTaskId)], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

      const result = await sut.execute(coilabWebInput(task.getId(), subTaskId));

      expect(result.id).toBeDefined();
      expect(result.url).toBe(MOCK_GITHUB_URL);
      const issues = repo.save.mock.calls[0][0].getSubTasks()[0].getMetadata()
        .issues as DevelopmentIssue[];
      expect(issues[0].url).toBe(MOCK_GITHUB_URL);
      expect(issues[0].repository).toBe('front');
      expect(issues[0].flowId).toBe(3);
      expect(issues[0].sprint).toBeUndefined();
    });

    it('throws when repository is missing', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const task = makeTask([makeSubTask(subTaskId)], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

      await expect(
        sut.execute({ ...coilabWebInput(task.getId(), subTaskId), repository: undefined }),
      ).rejects.toThrow('repository é obrigatório');
    });

    it('throws when sprint is provided', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const task = makeTask([makeSubTask(subTaskId)], COILAB_WEB_PROJECT_ID);
      repo.findById.mockResolvedValue(task);
      const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

      await expect(
        sut.execute({ ...coilabWebInput(task.getId(), subTaskId), sprint: 'Sprint 1' }),
      ).rejects.toThrow('sprint não é permitido');
    });
  });

  describe('other projects', () => {
    it('stores issue without GitHub url', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const task = makeTask([makeSubTask(subTaskId)]);
      repo.findById.mockResolvedValue(task);
      const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

      const result = await sut.execute(otherProjectInput(task.getId(), subTaskId));

      expect(result.id).toBeDefined();
      expect(result.url).toBeUndefined();
      const issues = repo.save.mock.calls[0][0].getSubTasks()[0].getMetadata()
        .issues as DevelopmentIssue[];
      expect(issues[0].sprint).toBe('Sprint 3');
      expect(issues[0].url).toBeUndefined();
    });

    it('throws when repository is provided', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const task = makeTask([makeSubTask(subTaskId)]);
      repo.findById.mockResolvedValue(task);
      const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

      await expect(
        sut.execute({ ...otherProjectInput(task.getId(), subTaskId), repository: 'back' as const }),
      ).rejects.toThrow('repository é exclusivo');
    });

    it('throws when flowId is missing', async () => {
      const repo = makeRepo();
      const subTaskId = randomUUID();
      const task = makeTask([makeSubTask(subTaskId)]);
      repo.findById.mockResolvedValue(task);
      const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

      await expect(
        sut.execute({ ...otherProjectInput(task.getId(), subTaskId), flowId: undefined }),
      ).rejects.toThrow('flowId é obrigatório');
    });
  });

  it('sets status=false by default', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

    await sut.execute(otherProjectInput(task.getId(), subTaskId));

    const issues = repo.save.mock.calls[0][0].getSubTasks()[0].getMetadata()
      .issues as DevelopmentIssue[];
    expect(issues[0].status).toBe(false);
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

    await expect(sut.execute(otherProjectInput(randomUUID(), randomUUID()))).rejects.toThrow(
      'Task not found',
    );
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

    await expect(sut.execute(otherProjectInput(task.getId(), randomUUID()))).rejects.toThrow(
      'SubTask not found',
    );
  });

  it('throws when subtask is not typeId=4', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId, 2)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddIssueToSubTaskUseCase(repo, makeGitHub());

    await expect(sut.execute(otherProjectInput(task.getId(), subTaskId))).rejects.toThrow(
      'não é do tipo Desenvolvimento',
    );
  });
});
