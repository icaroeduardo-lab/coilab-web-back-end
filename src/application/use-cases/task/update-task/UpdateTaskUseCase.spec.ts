import { UpdateTaskUseCase } from './UpdateTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
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

const makeTask = (id: string) =>
  new Task({
    id: TaskId(id),
    projectId: ProjectId(randomUUID()),
    name: 'Original',
    description: 'Desc original',
    taskNumber: '#20260001',
    priority: TaskPriority.BAIXA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(1),
    creatorId: UserId(randomUUID()),
  });

describe('UpdateTaskUseCase', () => {
  it('updates name and priority', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);

    await sut.execute({ id, name: 'Novo nome', priority: TaskPriority.ALTA });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getName()).toBe('Novo nome');
    expect(saved.getPriority()).toBe(TaskPriority.ALTA);
  });

  it('skips undefined fields', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);

    await sut.execute({ id, name: 'Novo' });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getDescription()).toBe('Desc original');
  });

  it('updates description', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);

    await sut.execute({ id, description: 'Nova descrição' });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getDescription()).toBe('Nova descrição');
  });

  it('updates applicantId', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);
    const newApplicantId = 2;

    await sut.execute({ id, applicantId: newApplicantId });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getApplicantId()).toBe(2);
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new UpdateTaskUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Task not found');
  });

  it('removes subtask with NAO_INICIADO status', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    const task = makeTask(id);
    const subTaskId = randomUUID();
    task.addSubTask(
      new SubTask({
        id: SubTaskId(subTaskId),
        taskId: TaskId(id),
        idUser: UserId(randomUUID()),
        status: SubTaskStatus.NAO_INICIADO,
        typeId: TaskToolId(1),
        taskNumber: '#20260001',
        expectedDelivery: new Date(),
      }),
    );
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateTaskUseCase(repo);

    await sut.execute({ id, subTaskIdsToRemove: [subTaskId] });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getSubTasks()).toHaveLength(0);
  });

  it('changes projectId', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);
    const newProjectId = randomUUID();

    await sut.execute({ id, projectId: newProjectId });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getProjectId()).toBe(newProjectId);
  });

  it('adds flow ids', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);

    await sut.execute({ id, flowIdsToAdd: [1, 2] });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getFlowIds()).toHaveLength(2);
    expect(saved.getFlowIds()).toContain(1);
  });

  it('removes flow by id', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    const task = makeTask(id);
    const flowId = 1;
    task.addFlowId(FlowId(flowId));
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateTaskUseCase(repo);

    await sut.execute({ id, flowIdsToRemove: [flowId] });

    const saved: Task = repo.save.mock.calls[0][0];
    expect(saved.getFlowIds()).toHaveLength(0);
  });

  it('throws when removing flow not found', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeTask(id));
    const sut = new UpdateTaskUseCase(repo);

    await expect(sut.execute({ id, flowIdsToRemove: [999] })).rejects.toThrow(
      'Flow não encontrado',
    );
  });

  it('throws when removing subtask with EM_PROGRESSO status', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    const task = makeTask(id);
    const subTaskId = randomUUID();
    task.addSubTask(
      new SubTask({
        id: SubTaskId(subTaskId),
        taskId: TaskId(id),
        idUser: UserId(randomUUID()),
        status: SubTaskStatus.EM_PROGRESSO,
        typeId: TaskToolId(1),
        taskNumber: '#20260001',
        expectedDelivery: new Date(),
      }),
    );
    repo.findById.mockResolvedValue(task);
    const sut = new UpdateTaskUseCase(repo);

    await expect(sut.execute({ id, subTaskIdsToRemove: [subTaskId] })).rejects.toThrow();
  });
});
