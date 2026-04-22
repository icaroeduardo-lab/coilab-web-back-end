import { AddFlowToTaskUseCase } from './AddFlowToTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeTask = (id: string) =>
  new Task({
    id: TaskId(id),
    projectId: ProjectId(randomUUID()),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(randomUUID()),
  });

describe('AddFlowToTaskUseCase', () => {
  it('adds flow id to task', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    const flowId = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new AddFlowToTaskUseCase(repo);

    await sut.execute({ taskId: id, flowId });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getFlowIds()).toHaveLength(1);
    expect(saved.getFlowIds()[0]).toBe(flowId);
  });

  it('throws when adding duplicate flow id', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    const flowId = randomUUID();
    const task = makeTask(id);
    task.addFlowId(flowId as any);
    repo.findById.mockResolvedValue(task);
    const sut = new AddFlowToTaskUseCase(repo);

    await expect(sut.execute({ taskId: id, flowId })).rejects.toThrow('Flow já adicionado');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddFlowToTaskUseCase(repo);

    await expect(sut.execute({ taskId: randomUUID(), flowId: randomUUID() })).rejects.toThrow('Task not found');
  });
});
