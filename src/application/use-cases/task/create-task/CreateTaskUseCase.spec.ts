import { CreateTaskUseCase } from './CreateTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTaskType } from '../../../../domain/entities/sub-task.entity';
import { TaskOutput } from '../shared/task-output';
import { randomUUID } from 'crypto';

const makeTaskRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const baseInput = () => ({
  projectId: randomUUID(),
  name: 'Task 1',
  description: 'Desc',
  priority: TaskPriority.MEDIA,
  applicantId: randomUUID(),
  creatorId: randomUUID(),
});

describe('CreateTaskUseCase', () => {
  it('creates task with status Backlog and generated number', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findLastTaskNumber.mockResolvedValue(null);
    const sut = new CreateTaskUseCase(taskRepo);

    const output: TaskOutput = await sut.execute(baseInput());

    const saved: Task = taskRepo.save.mock.calls[0][0];
    expect(saved.getStatus()).toBe(TaskStatus.BACKLOG);
    expect(saved.getName()).toBe('Task 1');
    expect(saved.getTaskNumber()).toMatch(/^#\d{8}$/);
    expect(output.id).toBe(saved.getId());
    expect(output.name).toBe('Task 1');
    expect(output.status).toBe(TaskStatus.BACKLOG);
  });

  it('stores applicantId and creatorId', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findLastTaskNumber.mockResolvedValue(null);
    const sut = new CreateTaskUseCase(taskRepo);
    const input = baseInput();

    await sut.execute(input);

    const saved: Task = taskRepo.save.mock.calls[0][0];
    expect(saved.getApplicantId()).toBe(input.applicantId);
    expect(saved.getCreatorId()).toBe(input.creatorId);
  });

  it('increments number from last registered', async () => {
    const year = new Date().getFullYear();
    const taskRepo = makeTaskRepo();
    taskRepo.findLastTaskNumber.mockResolvedValue(`#${year}0005`);
    const sut = new CreateTaskUseCase(taskRepo);

    const output = await sut.execute(baseInput());

    const saved: Task = taskRepo.save.mock.calls[0][0];
    expect(saved.getTaskNumber()).toBe(`#${year}0006`);
    expect(output.taskNumber).toBe(`#${year}0006`);
  });

  it('creates task with optional flowIds', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findLastTaskNumber.mockResolvedValue(null);
    const sut = new CreateTaskUseCase(taskRepo);
    const flowId = randomUUID();

    await sut.execute({ ...baseInput(), flowIds: [flowId] });

    const saved: Task = taskRepo.save.mock.calls[0][0];
    expect(saved.getFlowIds()).toHaveLength(1);
    expect(saved.getFlowIds()[0]).toBe(flowId);
  });

  it('creates task with optional subtasks', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findLastTaskNumber.mockResolvedValue(null);
    const sut = new CreateTaskUseCase(taskRepo);

    await sut.execute({
      ...baseInput(),
      subTasks: [
        { type: SubTaskType.DISCOVERY, idUser: randomUUID(), expectedDelivery: new Date() },
        { type: SubTaskType.DESIGN, idUser: randomUUID(), expectedDelivery: new Date() },
      ],
    });

    const saved: Task = taskRepo.save.mock.calls[0][0];
    expect(saved.getSubTasks()).toHaveLength(2);
  });

  it('creates task with diagram subtask', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findLastTaskNumber.mockResolvedValue(null);
    const sut = new CreateTaskUseCase(taskRepo);

    await sut.execute({
      ...baseInput(),
      subTasks: [{ type: SubTaskType.DIAGRAM, idUser: randomUUID(), expectedDelivery: new Date() }],
    });

    const saved: Task = taskRepo.save.mock.calls[0][0];
    expect(saved.getSubTasks()[0].getType()).toBe(SubTaskType.DIAGRAM);
  });
});
