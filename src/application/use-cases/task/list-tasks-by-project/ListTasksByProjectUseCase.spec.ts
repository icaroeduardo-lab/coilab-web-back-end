import { ListTasksByProjectUseCase } from './ListTasksByProjectUseCase';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../domain/entities/task.entity';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { Project, ProjectStatus } from '../../../../domain/entities/project.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
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

const makeApplicantRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByIds: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeProjectRepo = (): jest.Mocked<IProjectRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByIds: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  findLastProjectNumber: jest.fn(),
});

const projectId = randomUUID();
const applicantIdNum = 1;

const makeTask = () =>
  new Task({
    id: TaskId(randomUUID()),
    projectId: ProjectId(projectId),
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId: ApplicantId(applicantIdNum),
    creatorId: UserId(randomUUID()),
  });

const makeApplicant = () =>
  new Applicant({ id: ApplicantId(applicantIdNum), name: 'Setor X' });

const makeProject = () =>
  new Project({
    id: ProjectId(projectId),
    projectNumber: '#20260001',
    name: 'Projeto X',
    description: 'Desc',
    status: ProjectStatus.BACKLOG,
  });

describe('ListTasksByProjectUseCase', () => {
  it('returns full task list for project', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    taskRepo.findByProjectId.mockResolvedValue([makeTask(), makeTask()]);
    applicantRepo.findByIds.mockResolvedValue([makeApplicant()]);
    projectRepo.findByIds.mockResolvedValue([makeProject()]);
    const sut = new ListTasksByProjectUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute({ projectId });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('taskNumber');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('applicant');
    expect(result[0]).toHaveProperty('project');
    expect(result[0]).toHaveProperty('subTasks');
    expect(result[0]).toHaveProperty('createdAt');
  });

  it('returns empty when no tasks', async () => {
    const taskRepo = makeTaskRepo();
    const applicantRepo = makeApplicantRepo();
    const projectRepo = makeProjectRepo();
    taskRepo.findByProjectId.mockResolvedValue([]);
    const sut = new ListTasksByProjectUseCase(taskRepo, applicantRepo, projectRepo);

    const result = await sut.execute({ projectId: randomUUID() });

    expect(result).toEqual([]);
  });
});
