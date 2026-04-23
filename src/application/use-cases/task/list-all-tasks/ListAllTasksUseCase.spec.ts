import { ListAllTasksUseCase } from './ListAllTasksUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { DiscoverySubTask, SubTaskStatus, SubTaskType } from '../../../../domain/entities/sub-task.entity';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { Project } from '../../../../domain/entities/project.entity';
import { TaskId, ProjectId, ApplicantId, UserId, SubTaskId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeTaskRepo = (): jest.Mocked<ITaskRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByProjectId: jest.fn(),
  findLastTaskNumber: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeApplicantRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeProjectRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findLastProjectNumber: jest.fn(),
  save: jest.fn(),
});

const makeTask = (applicantId: string, projectId: string) =>
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
  it('returns enriched output for all tasks', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const applicantId = randomUUID();
    const projectId = randomUUID();
    const tasks = [makeTask(applicantId, projectId), makeTask(applicantId, projectId)];
    taskRepo.findAll.mockResolvedValue(tasks);
    applicantRepo.findById.mockResolvedValue(new Applicant({ id: ApplicantId(applicantId), name: 'Setor TI' }));
    projectRepo.findById.mockResolvedValue(new Project({ id: ProjectId(projectId), name: 'Projeto Alpha', projectNumber: '#20260001', description: 'D' }));
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0].taskNumber).toBe('#20260001');
    expect(result[0].description).toBe('Desc');
    expect(result[0].applicant.name).toBe('Setor TI');
    expect(result[0].project.name).toBe('Projeto Alpha');
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0]).not.toHaveProperty('creator');
  });

  it('returns empty when no tasks exist', async () => {
    const taskRepo = makeTaskRepo();
    taskRepo.findAll.mockResolvedValue([]);
    const sut = new ListAllTasksUseCase(taskRepo, makeApplicantRepo(), makeProjectRepo());

    const result = await sut.execute();

    expect(result).toEqual([]);
  });

  it('throws when applicant not found', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const applicantId = randomUUID();
    const projectId = randomUUID();
    taskRepo.findAll.mockResolvedValue([makeTask(applicantId, projectId)]);
    applicantRepo.findById.mockResolvedValue(null);
    projectRepo.findById.mockResolvedValue(new Project({ id: ProjectId(projectId), name: 'P', projectNumber: '#20260001', description: 'D' }));
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    await expect(sut.execute()).rejects.toThrow('Applicant not found');
  });

  it('deduplicates subtasks by type keeping latest createdAt', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const applicantId = randomUUID();
    const projectId = randomUUID();
    const task = makeTask(applicantId, projectId);
    const older = new DiscoverySubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(task.getId()),
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: new Date(),
      createdAt: new Date('2026-01-01'),
    });
    const newer = new DiscoverySubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(task.getId()),
      idUser: UserId(randomUUID()),
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: new Date(),
      createdAt: new Date('2026-03-01'),
    });
    task.addSubTask(older);
    task.addSubTask(newer);
    taskRepo.findAll.mockResolvedValue([task]);
    applicantRepo.findById.mockResolvedValue(new Applicant({ id: ApplicantId(applicantId), name: 'Setor' }));
    projectRepo.findById.mockResolvedValue(new Project({ id: ProjectId(projectId), name: 'P', projectNumber: '#20260001', description: 'D' }));
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute();

    expect(result[0].subTasks).toHaveLength(1);
    expect(result[0].subTasks[0].type).toBe(SubTaskType.DISCOVERY);
    expect(result[0].subTasks[0].status).toBe(SubTaskStatus.EM_PROGRESSO);
  });

  it('throws when project not found', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    const applicantId = randomUUID();
    const projectId = randomUUID();
    taskRepo.findAll.mockResolvedValue([makeTask(applicantId, projectId)]);
    applicantRepo.findById.mockResolvedValue(new Applicant({ id: ApplicantId(applicantId), name: 'Setor' }));
    projectRepo.findById.mockResolvedValue(null);
    const sut = new ListAllTasksUseCase(taskRepo, applicantRepo, projectRepo);

    await expect(sut.execute()).rejects.toThrow('Project not found');
  });
});
