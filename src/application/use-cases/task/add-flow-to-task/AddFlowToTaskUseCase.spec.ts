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
  it('adds flow to task', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new AddFlowToTaskUseCase(repo);

    await sut.execute({ taskId: id, flowId: randomUUID(), flowName: 'Fluxo principal' });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getFlows()).toHaveLength(1);
    expect(saved.getFlows()[0].getName()).toBe('Fluxo principal');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddFlowToTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: randomUUID(), flowId: randomUUID(), flowName: 'F' }),
    ).rejects.toThrow('Task not found');
  });
});
