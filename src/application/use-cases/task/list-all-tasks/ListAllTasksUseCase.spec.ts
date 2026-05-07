import { ListAllTasksUseCase } from './ListAllTasksUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { Project } from '../../../../domain/entities/project.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  TaskToolId,
} from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeTaskRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  findLastSubTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeApplicantRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeProjectRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findLastProjectNumber: jest.fn(),
  save: jest.fn(),
});

const makeApplicant = (id: number) => new Applicant({ id: ApplicantId(id), name: 'Setor TI' });
const makeProject = (id: string) =>
  new Project({
    id: ProjectId(id),
    name: 'Projeto Alpha',
    projectNumber: '#20260001',
    description: 'D',
  });

const makeTask = (applicantId: number, projectId: string) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(projectId),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(applicantId),
    creatorId: UserId(randomUUID()),
  });

describe('ListAllTasksUseCase', () => {
  it('returns paginated enriched output', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const applicantId = 1;
    const projectId = randomUUID();
    const tasks = [makeTask(applicantId, projectId), makeTask(applicantId, projectId)];
    taskRepo.findAll.mockResolvedValue(tasks);
    taskRepo.count.mockResolvedValue(2);
    applicantRepo.findByIds.mockResolvedValue([makeApplicant(applicantId)]);
    projectRepo.findByIds.mockResolvedValue([makeProject(projectId)]);
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute();

    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].taskNumber).toBe('#20260001');
    expect(result.data[0].description).toBe('Desc');
    expect(result.data[0].applicant.name).toBe('Setor TI');
    expect(result.data[0].project.name).toBe('Projeto Alpha');
    expect(result.data[0].createdAt).toBeInstanceOf(Date);
    expect(result.data[0]).not.toHaveProperty('creator');
  });

  it('passes skip/take to repository based on page/limit', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findAll.mockResolvedValue([]);
    taskRepo.count.mockResolvedValue(0);
    const sut = new ListAllTasksUseCase(taskRepo, makeApplicantRepo(), makeProjectRepo());

    await sut.execute({ page: 2, limit: 10 });

    expect(taskRepo.findAll).toHaveBeenCalledWith({ skip: 10, take: 10 });
  });

  it('returns empty data when no tasks exist', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findAll.mockResolvedValue([]);
    taskRepo.count.mockResolvedValue(0);
    const sut = new ListAllTasksUseCase(taskRepo, makeApplicantRepo(), makeProjectRepo());

    const result = await sut.execute();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('throws when applicant not found', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const projectId = randomUUID();
    taskRepo.findAll.mockResolvedValue([makeTask(1, projectId)]);
    taskRepo.count.mockResolvedValue(1);
    applicantRepo.findByIds.mockResolvedValue([]);
    projectRepo.findByIds.mockResolvedValue([makeProject(projectId)]);
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    await expect(sut.execute()).rejects.toThrow('Applicant not found');
  });

  it('throws when project not found', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const projectId = randomUUID();
    taskRepo.findAll.mockResolvedValue([makeTask(1, projectId)]);
    taskRepo.count.mockResolvedValue(1);
    applicantRepo.findByIds.mockResolvedValue([makeApplicant(1)]);
    projectRepo.findByIds.mockResolvedValue([]);
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    await expect(sut.execute()).rejects.toThrow('Project not found');
  });

  it('deduplicates subtasks by typeId keeping latest createdAt', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const projectId = randomUUID();
    const task = makeTask(1, projectId);
    const older = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(task.getId()),
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.REPROVADO,
      typeId: TaskToolId(1),
      taskNumber: '#20260001',
      expectedDelivery: new Date(),
      createdAt: new Date('2026-01-01'),
    });
    const newer = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(task.getId()),
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(1),
      taskNumber: '#20260001',
      expectedDelivery: new Date(),
      createdAt: new Date('2026-03-01'),
    });
    task.addSubTask(older);
    task.addSubTask(newer);
    taskRepo.findAll.mockResolvedValue([task]);
    taskRepo.count.mockResolvedValue(1);
    applicantRepo.findByIds.mockResolvedValue([makeApplicant(1)]);
    projectRepo.findByIds.mockResolvedValue([makeProject(projectId)]);
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute();

    expect(result.data[0].subTasks).toHaveLength(1);
    expect(result.data[0].subTasks[0].typeId).toBe(1);
    expect(result.data[0].subTasks[0].status).toBe(SubTaskStatus.EM_PROGRESSO);
  });

  it('keeps newer subtask when older comes second in array', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const projectId = randomUUID();
    const taskId = TaskId(randomUUID());
    const newer = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId,
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(1),
      taskNumber: '#20260001',
      expectedDelivery: new Date(),
      createdAt: new Date('2026-03-01'),
    });
    const older = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId,
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.REPROVADO,
      typeId: TaskToolId(1),
      taskNumber: '#20260001',
      expectedDelivery: new Date(),
      createdAt: new Date('2026-01-01'),
    });
    const task = new Task({
      id: taskId,
      projectId: ProjectId(projectId),
      name: 'Task',
      description: 'Desc',
      taskNumber: '#20260001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      applicantId: ApplicantId(1),
      creatorId: UserId(randomUUID()),
      subTasks: [newer, older],
    });
    taskRepo.findAll.mockResolvedValue([task]);
    taskRepo.count.mockResolvedValue(1);
    applicantRepo.findByIds.mockResolvedValue([makeApplicant(1)]);
    projectRepo.findByIds.mockResolvedValue([makeProject(projectId)]);
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute();

    expect(result.data[0].subTasks[0].status).toBe(SubTaskStatus.EM_PROGRESSO);
  });
});
