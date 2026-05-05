import { RemoveDesignFromSubTaskUseCase } from './RemoveDesignFromSubTaskUseCase';
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

const makeSubTask = (id: string, designs: { id: string; title: string; urlImage: string }[] = []) =>
  new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    typeId: TaskToolId(2),
    taskNumber: '#20260001',
    expectedDelivery: new Date(),
    metadata: designs.length > 0 ? { designs } : undefined,
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

describe('RemoveDesignFromSubTaskUseCase', () => {
  it('removes design from subtask metadata', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const designId = randomUUID();
    const task = makeTask([
      makeSubTask(subTaskId, [
        { id: designId, title: 'Tela inicial', urlImage: 'https://example.com/image.png' },
      ]),
    ]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, designId });

    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    const designs = subTask.getMetadata().designs as { id: string }[];
    expect(designs).toHaveLength(0);
  });

  it('throws when design not found', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId, [])]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, designId: randomUUID() }),
    ).rejects.toThrow('não encontrado');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: randomUUID(), subTaskId: randomUUID(), designId: randomUUID() }),
    ).rejects.toThrow('Task not found');
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId: randomUUID(), designId: randomUUID() }),
    ).rejects.toThrow('SubTask not found');
  });
});
