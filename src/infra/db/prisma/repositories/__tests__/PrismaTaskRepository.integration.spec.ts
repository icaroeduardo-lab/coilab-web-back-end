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
import {
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  SubTaskStatus,
  Level,
  Frequency,
} from '../../../../../domain/entities/sub-task.entity';
import { Design } from '../../../../../domain/value-objects/design.vo';
import { Diagram } from '../../../../../domain/value-objects/diagram.vo';
import {
  TaskId,
  ProjectId,
  ApplicantId,
  UserId,
  SubTaskId,
  FlowId,
  DesignId,
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

  const applicant = new Applicant({ id: ApplicantId(randomUUID()), name: 'Solicitante' });
  await applicantRepo.save(applicant);
  applicantId = applicant.getId();

  const creator = new User({
    id: UserId(randomUUID()),
    name: 'Criador',
    email: 'criador@example.com',
  });
  await userRepo.save(creator);
  creatorId = creator.getId();
});

const makeTask = (
  subTasks: (DiscoverySubTask | DesignSubTask | DiagramSubTask)[] = [],
  flowIds: FlowId[] = [],
) =>
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
    const flow = new Flow({ id: FlowId(randomUUID()), name: 'Flow A' });
    await flowRepo.save(flow);

    const task = makeTask([], [flow.getId()]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    expect(found!.getFlowIds()).toHaveLength(1);
    expect(found!.getFlowIds()[0]).toBe(flow.getId());
  });
});

describe('PrismaTaskRepository — DiscoverySubTask', () => {
  it('persists and restores discovery subtask with form data', async () => {
    const subTask = new DiscoverySubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: new Date('2026-12-31'),
    });
    subTask.updateForm(
      {
        complexity: Level.HIGH,
        projectName: 'Nome do Projeto',
        summary: 'Resumo',
        painPoints: 'Dores',
        frequency: Frequency.DAILY,
        currentProcess: 'Processo atual',
        inactionCost: 'Custo',
        volume: 'Volume',
        avgTime: 'Tempo médio',
        humanDependency: Level.MEDIUM,
        rework: 'Retrabalho',
        previousAttempts: 'Tentativas',
        benchmark: 'Benchmark',
        institutionalPriority: Level.HIGH,
        technicalOpinion: 'Opinião técnica',
      },
      creatorId,
    );

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getDiscovery()[0];
    expect(restored).toBeDefined();
    const form = restored.getForm();
    expect(form.complexity?.value).toBe(Level.HIGH);
    expect(form.projectName?.value).toBe('Nome do Projeto');
    expect(form.frequency?.value).toBe(Frequency.DAILY);
    expect(form.humanDependency?.value).toBe(Level.MEDIUM);
  });

  it('persists discovery subtask with empty form', async () => {
    const subTask = new DiscoverySubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date('2026-12-31'),
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getDiscovery()[0];
    expect(restored.getForm().complexity).toBeUndefined();
  });
});

describe('PrismaTaskRepository — DesignSubTask', () => {
  it('persists and restores design subtask with designs', async () => {
    const design = new Design({
      id: DesignId(randomUUID()),
      title: 'Tela Inicial',
      description: 'Layout da home',
      urlImage: 'https://example.com/img.png',
      user: applicantId,
      dateUpload: new Date('2026-01-15'),
    });

    const subTask = new DesignSubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: new Date('2026-12-31'),
      designs: [design],
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getDesign()[0];
    expect(restored.getDesigns()).toHaveLength(1);
    expect(restored.getDesigns()[0].getTitle()).toBe('Tela Inicial');
    expect(restored.getDesigns()[0].getUrlImage()).toBe('https://example.com/img.png');
    expect(restored.getDesigns()[0].getId()).toBe(design.getId());
  });

  it('persists design subtask with no designs', async () => {
    const subTask = new DesignSubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date('2026-12-31'),
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    expect(found!.getDesign()[0].getDesigns()).toHaveLength(0);
  });
});

describe('PrismaTaskRepository — DiagramSubTask', () => {
  it('persists and restores diagram subtask with diagrams', async () => {
    const diagram = new Diagram({
      title: 'Fluxo Principal',
      description: 'Diagrama do fluxo',
      urlDiagram: 'https://example.com/diagram.png',
      user: applicantId,
      dateUpload: new Date('2026-01-15'),
    });

    const subTask = new DiagramSubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: new Date('2026-12-31'),
      diagrams: [diagram],
    });

    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    const restored = found!.getDiagram()[0];
    expect(restored.getDiagrams()).toHaveLength(1);
    expect(restored.getDiagrams()[0].getTitle()).toBe('Fluxo Principal');
    expect(restored.getDiagrams()[0].getUrlDiagram()).toBe('https://example.com/diagram.png');
  });
});

describe('PrismaTaskRepository — save syncs subtasks', () => {
  it('replaces subtasks on re-save', async () => {
    const subTask = new DesignSubTask({
      id: SubTaskId(randomUUID()),
      taskId: TaskId(randomUUID()),
      idUser: creatorId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date('2026-12-31'),
    });
    const task = makeTask([subTask]);
    await taskRepo.save(task);

    const design = new Design({
      id: DesignId(randomUUID()),
      title: 'Nova Imagem',
      description: 'Desc',
      urlImage: 'https://example.com/new.png',
      user: applicantId,
      dateUpload: new Date(),
    });
    subTask.start();
    (task.getSubTasks()[0] as DesignSubTask).addDesign(design);
    await taskRepo.save(task);

    const found = await taskRepo.findById(task.getId());
    expect(found!.getDesign()[0].getDesigns()).toHaveLength(1);
    expect(found!.getSubTasks()[0].getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
  });
});
