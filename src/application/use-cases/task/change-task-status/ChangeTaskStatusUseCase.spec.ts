import { ChangeTaskStatusUseCase } from './ChangeTaskStatusUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { TaskId, ProjectId, ApplicantId, UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
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

describe('ChangeTaskStatusUseCase', () => {
  it('changes task status', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new ChangeTaskStatusUseCase(repo);

    await sut.execute({ id, status: TaskStatus.EM_EXECUCAO });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new ChangeTaskStatusUseCase(repo);

    await expect(sut.execute({ id: randomUUID(), status: TaskStatus.CONCLUIDO })).rejects.toThrow(
      'Task not found',
    );
  });
});
