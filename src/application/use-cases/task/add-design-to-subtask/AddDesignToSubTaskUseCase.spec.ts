import { AddDesignToSubTaskUseCase } from './AddDesignToSubTaskUseCase';
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
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeSubTask = (id: string, typeId = 2) =>
  new SubTask({
    id: SubTaskId(id),
    taskId: TaskId(randomUUID()),
    idUser: UserId(randomUUID()),
    status: SubTaskStatus.EM_PROGRESSO,
    typeId: TaskToolId(typeId),
    expectedDelivery: new Date(),
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

const validInput = (taskId: string, subTaskId: string) => ({
  taskId,
  subTaskId,
  userId: randomUUID(),
  title: 'Tela inicial',
  description: 'Layout da home',
  urlImage: 'https://example.com/image.png',
});

describe('AddDesignToSubTaskUseCase', () => {
  it('adds design to subtask metadata', async () => {
    const repo = makeRepo();
    const subTaskId = randomUUID();
    const task = makeTask([makeSubTask(subTaskId, 2)]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddDesignToSubTaskUseCase(repo);

    const result = await sut.execute(validInput(task.getId(), subTaskId));

    expect(result.id).toBeDefined();
    const saved: Task = repo.save.mock.calls[0][0];
    const subTask = saved.getSubTasks().find((s) => s.getId() === subTaskId)!;
    const designs = subTask.getMetadata().designs as { title: string; urlImage: string }[];
    expect(designs).toHaveLength(1);
    expect(designs[0].title).toBe('Tela inicial');
    expect(designs[0].urlImage).toBe('https://example.com/image.png');
  });

  it('throws when task not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new AddDesignToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(randomUUID(), randomUUID()))).rejects.toThrow(
      'Task not found',
    );
  });

  it('throws when subtask not found', async () => {
    const repo = makeRepo();
    const task = makeTask([]);
    repo.findById.mockResolvedValue(task);
    const sut = new AddDesignToSubTaskUseCase(repo);

    await expect(sut.execute(validInput(task.getId(), randomUUID()))).rejects.toThrow(
      'SubTask not found',
    );
  });
});
