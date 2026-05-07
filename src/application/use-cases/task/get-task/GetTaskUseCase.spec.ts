import { GetTaskUseCase } from './GetTaskUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { User } from '../../../../domain/entities/user.entity';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { Project } from '../../../../domain/entities/project.entity';
import { Flow } from '../../../../domain/value-objects/flow.vo';
import { SubTask, SubTaskStatus } from '../../../../domain/entities/sub-task.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  FlowId,
  SubTaskId,
  TaskToolId,
} from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeTaskRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  findLastSubTaskNumber: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeUserRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  save: jest.fn(),
});

const makeApplicantRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeFlowRepo = (): jest.Mocked<IFlowRepository> => ({
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

const makeTask = (creatorId: string, applicantId: number, projectId: string) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(projectId),
    name: 'Task 1',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(applicantId),
    creatorId: UserId(creatorId),
  });

const makeSut = (
  taskRepo: jest.Mocked<ITaskRepository>,
  userRepo: jest.Mocked<IUserRepository>,
  applicantRepo: jest.Mocked<IApplicantRepository>,
  flowRepo: jest.Mocked<IFlowRepository>,
  projectRepo: jest.Mocked<IProjectRepository>,
) => new GetTaskUseCase(taskRepo, userRepo, applicantRepo, flowRepo, projectRepo);

describe('GetTaskUseCase', () => {
  it('returns task detail with creator, applicant, project and flows', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const applicantRepo = makeApplicantRepo();
    const flowRepo = makeFlowRepo();
    const projectRepo = makeProjectRepo();
    const creatorId = randomUUID();
    const applicantId = 1;
    const projectId = randomUUID();
    const flowId = 1;
    const task = makeTask(creatorId, applicantId, projectId);
    task.addFlowId(FlowId(flowId));
    taskRepo.findById.mockResolvedValue(task);
    userRepo.findById.mockResolvedValue(
      new User({
        id: UserId(creatorId),
        name: 'John Doe',
        email: 'john@example.com',
        imageUrl: 'https://img.example.com',
      }),
    );
    applicantRepo.findById.mockResolvedValue(
      new Applicant({ id: ApplicantId(applicantId), name: 'Setor TI' }),
    );
    flowRepo.findByIds.mockResolvedValue([
      new Flow({ id: FlowId(flowId), name: 'Fluxo Principal' }),
    ]);
    projectRepo.findById.mockResolvedValue(
      new Project({
        id: ProjectId(projectId),
        name: 'Projeto Alpha',
        projectNumber: '#20260001',
        description: 'Desc',
      }),
    );
    const sut = makeSut(taskRepo, userRepo, applicantRepo, flowRepo, projectRepo);

    const result = await sut.execute({ id: randomUUID() });

    expect(result.name).toBe('Task 1');
    expect(result.creator.name).toBe('John Doe');
    expect(result.applicant.name).toBe('Setor TI');
    expect(result.project.name).toBe('Projeto Alpha');
    expect(result.flows).toHaveLength(1);
    expect(result.flows[0].name).toBe('Fluxo Principal');
    expect(result.subTasks).toEqual([]);
  });

  it('returns subtasks mapped correctly', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const applicantRepo = makeApplicantRepo();
    const flowRepo = makeFlowRepo();
    const projectRepo = makeProjectRepo();
    const creatorId = randomUUID();
    const applicantId = 1;
    const projectId = randomUUID();
    const task = makeTask(creatorId, applicantId, projectId);
    task.addSubTask(
      new SubTask({
        id: SubTaskId(randomUUID()),
        taskId: task.getId(),
        idUser: UserId(randomUUID()),
        status: SubTaskStatus.EM_PROGRESSO,
        typeId: TaskToolId(1),
        taskNumber: '#20260001',
        expectedDelivery: new Date('2026-12-31'),
      }),
    );
    taskRepo.findById.mockResolvedValue(task);
    userRepo.findById.mockResolvedValue(
      new User({ id: UserId(creatorId), name: 'John', email: 'john@example.com' }),
    );
    applicantRepo.findById.mockResolvedValue(
      new Applicant({ id: ApplicantId(applicantId), name: 'Setor' }),
    );
    flowRepo.findByIds.mockResolvedValue([]);
    projectRepo.findById.mockResolvedValue(
      new Project({
        id: ProjectId(projectId),
        name: 'P',
        projectNumber: '#20260001',
        description: 'D',
      }),
    );
    const sut = makeSut(taskRepo, userRepo, applicantRepo, flowRepo, projectRepo);

    const result = await sut.execute({ id: randomUUID() });

    expect(result.subTasks).toHaveLength(1);
    expect(result.subTasks[0].status).toBe(SubTaskStatus.EM_PROGRESSO);
    expect(result.subTasks[0].expectedDelivery).toBeInstanceOf(Date);
  });

  it('throws when task not found', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findById.mockResolvedValue(null);
    const sut = makeSut(
      taskRepo,
      makeUserRepo(),
      makeApplicantRepo(),
      makeFlowRepo(),
      makeProjectRepo(),
    );

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Task not found');
  });

  it('throws when creator not found', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const applicantRepo = makeApplicantRepo();
    const flowRepo = makeFlowRepo();
    const projectRepo = makeProjectRepo();
    taskRepo.findById.mockResolvedValue(makeTask(randomUUID(), 1, randomUUID()));
    userRepo.findById.mockResolvedValue(null);
    applicantRepo.findById.mockResolvedValue(new Applicant({ id: ApplicantId(1), name: 'Setor' }));
    flowRepo.findByIds.mockResolvedValue([]);
    projectRepo.findById.mockResolvedValue(
      new Project({
        id: ProjectId(randomUUID()),
        name: 'P',
        projectNumber: '#20260001',
        description: 'D',
      }),
    );
    const sut = makeSut(taskRepo, userRepo, applicantRepo, flowRepo, projectRepo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Creator not found');
  });

  it('throws when applicant not found', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const applicantRepo = makeApplicantRepo();
    const flowRepo = makeFlowRepo();
    const projectRepo = makeProjectRepo();
    const creatorId = randomUUID();
    taskRepo.findById.mockResolvedValue(makeTask(creatorId, 1, randomUUID()));
    userRepo.findById.mockResolvedValue(
      new User({ id: UserId(creatorId), name: 'John', email: 'john@example.com' }),
    );
    applicantRepo.findById.mockResolvedValue(null);
    flowRepo.findByIds.mockResolvedValue([]);
    projectRepo.findById.mockResolvedValue(
      new Project({
        id: ProjectId(randomUUID()),
        name: 'P',
        projectNumber: '#20260001',
        description: 'D',
      }),
    );
    const sut = makeSut(taskRepo, userRepo, applicantRepo, flowRepo, projectRepo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Applicant not found');
  });

  it('throws when project not found', async () => {
    const taskRepo = makeTaskRepo();
    const userRepo = makeUserRepo();
    const applicantRepo = makeApplicantRepo();
    const flowRepo = makeFlowRepo();
    const projectRepo = makeProjectRepo();
    const creatorId = randomUUID();
    const applicantId = 1;
    taskRepo.findById.mockResolvedValue(makeTask(creatorId, applicantId, randomUUID()));
    userRepo.findById.mockResolvedValue(
      new User({ id: UserId(creatorId), name: 'John', email: 'john@example.com' }),
    );
    applicantRepo.findById.mockResolvedValue(
      new Applicant({ id: ApplicantId(applicantId), name: 'Setor' }),
    );
    flowRepo.findByIds.mockResolvedValue([]);
    projectRepo.findById.mockResolvedValue(null);
    const sut = makeSut(taskRepo, userRepo, applicantRepo, flowRepo, projectRepo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Project not found');
  });
});
