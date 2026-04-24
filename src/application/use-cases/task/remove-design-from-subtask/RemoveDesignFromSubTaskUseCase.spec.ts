import { RemoveDesignFromSubTaskUseCase } from './RemoveDesignFromSubTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import {
  DesignSubTask,
  DiscoverySubTask,
  SubTaskStatus,
} from '../../../../domain/entities/sub-task.entity';
import { Design } from '../../../../domain/value-objects/design.vo';
import { TaskId, ProjectId, ApplicantId, UserId, SubTaskId, DesignId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeDesign = (id: string) =>
  new Design({
    id: DesignId(id),
    title: 'Tela inicial',
    description: 'Layout',
    urlImage: 'https://example.com/image.png',
    user: ApplicantId(randomUUID()),
    dateUpload: new Date(),
  });

const makeDesignSubTask = (id: string, designs: Design[] = []) =>
  new DesignSubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    expectedDelivery: new Date(),
    designs,
  });

const makeDiscoverySubTask = (id: string) =>
  new DiscoverySubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    expectedDelivery: new Date(),
  });

const makeTask = (subTasks: (DesignSubTask | DiscoverySubTask)[] = []) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(randomUUID()),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.EM_EXECUCAO,
    applicantId: ApplicantId(randomUUID()),
    creatorId: UserId(randomUUID()),
    subTasks,
  });

describe('RemoveDesignFromSubTaskUseCase', () => {
  it('removes design from subtask', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const designId = randomUUID();
    const task = makeTask([makeDesignSubTask(subTaskId, [makeDesign(designId)])]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await sut.execute({ taskId: task.getId(), subTaskId, designId });

    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks().find((s) => s.getId() === subTaskId) as DesignSubTask;
    expect(subTask.getDesigns()).toHaveLength(0);
  });

  it('throws when design not found', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDesignSubTask(subTaskId, [])]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, designId: randomUUID() }),
    ).rejects.toThrow('não encontrado');
  });

  it('throws when subtask type is not Design', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeDiscoverySubTask(subTaskId)]);
    repo.findById.mockResolvedValue(task);
    const sut = new RemoveDesignFromSubTaskUseCase(repo);

    await expect(
      sut.execute({ taskId: task.getId(), subTaskId, designId: randomUUID() }),
    ).rejects.toThrow('SubTask is not a Design type');
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
