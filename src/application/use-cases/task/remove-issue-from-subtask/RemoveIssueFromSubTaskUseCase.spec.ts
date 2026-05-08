import { RemoveIssueFromSubTaskUseCase } from './RemoveIssueFromSubTaskUseCase';
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
  title: 'Issue',
  url: 'https://github.com/org/repo/issues/1',
  flowId: 1,
  status: false,
  ...overrides,
});

const makeDevSubTask = (id: string, issues: DevelopmentIssue[] = []) => {
  const sub = new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    typeId: TaskToolId(4),
    taskNumber: '#20260001',
    expectedDelivery: new Date(),
    metadata: { issues },
  });
  return sub;
};

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

describe('RemoveIssueFromSubTaskUseCase', () => {
  it('removes issue from metadata', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue();
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveIssueFromSubTaskUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id });

    const saved: Task = repo.save.mock.calls[0][0];
    const issues = saved.getSubTasks()[0].getMetadata().issues as DevelopmentIssue[];
    expect(issues).toHaveLength(0);
  });

  it('throws when issue has status=true', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const issue = makeIssue({ status: true });
    const task = makeTask([makeDevSubTask(subTaskId, [issue])]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveIssueFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: issue.id }),
    ).rejects.toThrow('Issue concluída não pode ser removida');
  });

  it('throws when issue not found', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDevSubTask(subTaskId, [makeIssue()])]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveIssueFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: randomUUID() }),
    ).rejects.toThrow('Issue não encontrada');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new RemoveIssueFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: randomUUID(), subTaskId: randomUUID(), issueId: randomUUID() }),
    ).rejects.toThrow('Task not found');
  });

  it('throws when subtask is not typeId=4', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const sub = new SubTask({
      id: SubTaskId(subTaskId),
      taskId: TaskId(randomUUID()),
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(2),
      taskNumber: '#20260001',
      expectedDelivery: new Date(),
    });
    const task = makeTask([sub]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveIssueFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, issueId: randomUUID() }),
    ).rejects.toThrow('não é do tipo Desenvolvimento');
  });
});
