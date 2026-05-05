import { randomUUID } from 'crypto';
import { PrismaTaskRepository } from '../PrismaTaskRepository';
import { PrismaProjectRepository } from '../PrismaProjectRepository';
import { PrismaApplicantRepository } from '../PrismaApplicantRepository';
import { PrismaUserRepository } from '../PrismaUserRepository';
import { PrismaFlowRepository } from '../PrismaFlowRepository';
import { Task, TaskPriority, TaskStatus } from '../../../../../domain/entities/task.entity';
import { Project, ProjectStatus } from '../../../../../domain/entities/project.entity';
import { Applicant } from '../../../../../domain/entities/applicant.entity';
import { User } from '../../../../../domain/entities/user.entity';
import { Flow } from '../../../../../domain/value-objects/flow.vo';
import { SubTask, SubTaskStatus } from '../../../../../domain/entities/sub-task.entity';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
  DesignId,
  TaskToolId,
} from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const taskRepo = new PrismaTaskRepository();
const projectRepo = new PrismaProjectRepository();
const applicantRepo = new PrismaApplicantRepository();
const userRepo = new PrismaUserRepository();
const flowRepo = new PrismaFlowRepository();

let projectId: ProjectId;
let applicantId: ApplicantId;
let creatorId: UserId;

beforeEach(async () => {
  await truncateAll();

  const project = new Project({
    id: ProjectId(randomUUID()),
    name: 'Projeto',
    projectNumber: '#20260001',
    description: 'Desc',
    status: ProjectStatus.BACKLOG,
  });
  await projectRepo.save(project);
  projectId = project.getId();

  const applicant = new Applicant({ id: ApplicantId(0), name: 'Solicitante' });
  const savedApplicant = await applicantRepo.save(applicant);
  applicantId = savedApplicant.getId();

  const creator = new User({
    id: UserId(randomUUID()),
    name: 'Criador',
    email: 'criador@example.com',
  });
  await userRepo.save(creator);
  creatorId = creator.getId();
});

const makeTask = (subTasks: SubTask[] = [], flowIds: FlowId[] = []) =>
  new Task({
    id: TaskId(randomUUID()),
    projectId,
    name: 'Task',
    description: 'Desc',
    taskNumber: '#20260001',
    priority: TaskPriority.MEDIA,
    status: TaskStatus.BACKLOG,
    applicantId,
    creatorId,
    subTasks,
    flowIds,
    createdAt: new Date(),
  });

describe('PrismaTaskRepository — basic', () => {
  it('saves and retrieves task by id', async () => {
    const task = makeTask();
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(task.getId());
    expect(found!.getName()).toBe('Task');
  });

  it('returns null for unknown id', async () => {
    const result = await taskRepo.findById(TaskId(randomUUID()));
    expect(result).toBeNull();
  });

  it('upsert updates existing task', async () => {
    const task = makeTask();
    await taskRepo.save(task);
    task.changeName('Nome Atualizado');
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    expect(found!.getName()).toBe('Nome Atualizado');
  });

  it('findByProjectId returns tasks for project', async () => {
    await taskRepo.save(makeTask());
    const all = await taskRepo.findByProjectId(projectId);
    expect(all).toHaveLength(1);
  });

  it('findLastTaskNumber returns highest number', async () => {
    const t1 = makeTask();
    const t2 = new Task({
      id: TaskId(randomUUID()),
      projectId,
      name: 'Task 2',
      description: 'Desc',
      taskNumber: '#20260002',
      priority: TaskPriority.ALTA,
      status: TaskStatus.BACKLOG,
      applicantId,
      creatorId,
    });
    await taskRepo.save(t1);
    await taskRepo.save(t2);

    const last = await taskRepo.findLastTaskNumber();
    expect(last).toBe('#20260002');
  });

  it('delete removes task', async () => {
    const task = makeTask();
    await taskRepo.save(task);
    await taskRepo.delete(task.getId());

    const found = await taskRepo.findById(task.getId());
    expect(found).toBeNull();
  });

  it('saves and retrieves task with flows', async () => {
    const flow = await flowRepo.save(new Flow({ id: FlowId(0), name: 'Flow A' }));

    const task = makeTask([], [flow.getId()]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    expect(found!.getFlowIds()).toHaveLength(1);
    expect(found!.getFlowIds()[0]).toBe(flow.getId());
  });
});

describe('PrismaTaskRepository — Discovery SubTask (typeId=1)', () => {
  it('persists and restores discovery subtask with metadata form data', async () => {
    const subTask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(1),
      expectedDelivery: new Date('2026-12-31'),
      metadata: {
        form: {
          complexity: { value: 'high', userId: creatorId, filledAt: new Date().toISOString() },
          projectName: { value: 'Nome do Projeto', userId: creatorId, filledAt: new Date().toISOString() },
        },
      },
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getSubTasks().filter((s) => s.getTypeId() === 1)[0];
    expect(restored).toBeDefined();
    expect(restored.getTypeId()).toBe(1);
    const form = restored.getMetadata().form as Record<string, { value: unknown }>;
    expect(form?.complexity?.value).toBe('high');
    expect(form?.projectName?.value).toBe('Nome do Projeto');
  });

  it('persists discovery subtask with empty metadata', async () => {
    const subTask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.NAO_INICIADO,
      typeId: TaskToolId(1),
      expectedDelivery: new Date('2026-12-31'),
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getSubTasks().filter((s) => s.getTypeId() === 1)[0];
    expect(restored.getMetadata()).toEqual({});
  });
});

describe('PrismaTaskRepository — Design SubTask (typeId=2)', () => {
  it('persists and restores design subtask with designs in metadata', async () => {
    const designId = DesignId(randomUUID());
    const subTask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(2),
      expectedDelivery: new Date('2026-12-31'),
      metadata: {
        designs: [
          {
            id: designId,
            title: 'Tela Inicial',
            description: 'Layout da home',
            urlImage: 'https://example.com/img.png',
            userId: creatorId,
            dateUpload: new Date('2026-01-15').toISOString(),
          },
        ],
      },
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getSubTasks().filter((s) => s.getTypeId() === 2)[0];
    const designs = restored.getMetadata().designs as { title: string; urlImage: string }[];
    expect(designs).toHaveLength(1);
    expect(designs[0].title).toBe('Tela Inicial');
    expect(designs[0].urlImage).toBe('https://example.com/img.png');
  });

  it('persists design subtask with no designs', async () => {
    const subTask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.NAO_INICIADO,
      typeId: TaskToolId(2),
      expectedDelivery: new Date('2026-12-31'),
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getSubTasks().filter((s) => s.getTypeId() === 2)[0];
    expect(restored.getMetadata().designs).toBeUndefined();
  });
});

describe('PrismaTaskRepository — Diagram SubTask (typeId=3)', () => {
  it('persists and restores diagram subtask with diagrams in metadata', async () => {
    const subTask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.EM_PROGRESSO,
      typeId: TaskToolId(3),
      expectedDelivery: new Date('2026-12-31'),
      metadata: {
        diagrams: [
          {
            title: 'Fluxo Principal',
            description: 'Diagrama do fluxo',
            urlDiagram: 'https://example.com/diagram.png',
            userId: creatorId,
            dateUpload: new Date('2026-01-15').toISOString(),
          },
        ],
      },
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getSubTasks().filter((s) => s.getTypeId() === 3)[0];
    const diagrams = restored.getMetadata().diagrams as { title: string; urlDiagram: string }[];
    expect(diagrams).toHaveLength(1);
    expect(diagrams[0].title).toBe('Fluxo Principal');
    expect(diagrams[0].urlDiagram).toBe('https://example.com/diagram.png');
  });
});

describe('PrismaTaskRepository — save syncs subtasks', () => {
  it('replaces subtasks on re-save', async () => {
    const subTask = new SubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.NAO_INICIADO,
      typeId: TaskToolId(2),
      expectedDelivery: new Date('2026-12-31'),
    });
    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const newDesign = {
      id: DesignId(randomUUID()),
      title: 'Nova Imagem',
      description: 'Desc',
      urlImage: 'https://example.com/new.png',
      userId: creatorId,
      dateUpload: new Date().toISOString(),
    };
    subTask.start();
    subTask.updateMetadata({ designs: [newDesign] });
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getSubTasks().filter((s) => s.getTypeId() === 2)[0];
    const designs = restored.getMetadata().designs as { title: string }[];
    expect(designs).toHaveLength(1);
    expect(found!.getSubTasks()[0].getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
  });
});
