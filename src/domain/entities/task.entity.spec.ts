import { Task, TaskPriority, TaskStatus } from './task.entity';
import { DiscoverySubTask, DesignSubTask, DiagramSubTask, SubTaskStatus } from './sub-task.entity';
import { Applicant } from '../value-objects/applicant.vo';
import { Flow } from '../value-objects/flow.vo';
import { TaskId, ProjectId, SubTaskId, ApplicantId, FlowId } from '../value-objects/entity-ids';

describe('Task Entity', () => {
  const taskId = TaskId('550e8400-e29b-41d4-a716-446655440001');
  const projectId = ProjectId('550e8400-e29b-41d4-a716-446655440000');
  const deliveryDate = new Date('2026-12-31');

  const applicant = new Applicant({
    id: ApplicantId('550e8400-e29b-41d4-a716-446655440003'),
    name: 'John Doe',
  });

  const discovery = new DiscoverySubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
    taskId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const design = new DesignSubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440009'),
    taskId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const diagram = new DiagramSubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440011'),
    taskId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const baseTask = () =>
    new Task({
      id: taskId,
      projectId,
      name: 'Task 01',
      description: 'Task description',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      applicant,
    });

  it('should create a new task with subtasks', () => {
    const task = new Task({
      id: taskId,
      projectId,
      name: 'Task 01',
      description: 'Task description',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      applicant,
      subTasks: [discovery, design, diagram],
    });

    expect(task.getStatus()).toBe(TaskStatus.BACKLOG);
    expect(task.getSubTasks()).toHaveLength(3);
    expect(task.getDiscovery()).toHaveLength(1);
    expect(task.getDesign()).toHaveLength(1);
    expect(task.getDiagram()).toHaveLength(1);
  });

  it('should expose all getters correctly', () => {
    const task = baseTask();

    expect(task.getId()).toBe(taskId);
    expect(task.getProjectId()).toBe(projectId);
    expect(task.getName()).toBe('Task 01');
    expect(task.getDescription()).toBe('Task description');
    expect(task.getTaskNumber()).toBe('T-001');
    expect(task.getPriority()).toBe(TaskPriority.MEDIA);
    expect(task.getApplicant().getName()).toBe('John Doe');
    expect(task.getCreatedAt()).toBeInstanceOf(Date);
    expect(task.getFlows()).toHaveLength(0);
  });

  it('should change name correctly', () => {
    const task = baseTask();
    task.changeName('New Name');
    expect(task.getName()).toBe('New Name');
  });

  it('should change description correctly', () => {
    const task = baseTask();
    task.changeDescription('New description');
    expect(task.getDescription()).toBe('New description');
  });

  it('should change status correctly', () => {
    const task = baseTask();
    task.changeStatus(TaskStatus.EM_EXECUCAO);
    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('should change task number correctly', () => {
    const task = baseTask();
    task.changeTaskNumber('T-002');
    expect(task.getTaskNumber()).toBe('T-002');
  });

  it('should change priority correctly', () => {
    const task = baseTask();
    task.changePriority(TaskPriority.ALTA);
    expect(task.getPriority()).toBe(TaskPriority.ALTA);
  });

  it('should change applicant correctly', () => {
    const task = baseTask();
    const newApplicant = new Applicant({
      id: ApplicantId('550e8400-e29b-41d4-a716-446655440004'),
      name: 'Jane Smith',
    });
    task.changeApplicant(newApplicant);
    expect(task.getApplicant().getName()).toBe('Jane Smith');
  });

  it('should add flow correctly', () => {
    const task = baseTask();
    const flow = new Flow({
      id: FlowId('550e8400-e29b-41d4-a716-446655440005'),
      name: 'Flow A',
    });
    task.addFlow(flow);
    expect(task.getFlows()).toHaveLength(1);
    expect(task.getFlows()[0].getName()).toBe('Flow A');
  });
});
