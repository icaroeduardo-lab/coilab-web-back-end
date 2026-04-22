import { Task, TaskPriority, TaskStatus } from './task.entity';
import { DiscoverySubTask, DesignSubTask, DiagramSubTask, SubTaskStatus } from './sub-task.entity';
import { Flow } from '../value-objects/flow.vo';
import { TaskId, ProjectId, SubTaskId, ApplicantId, UserId, FlowId } from '../shared/entity-ids';

describe('Task Entity', () => {
  const taskId = TaskId('550e8400-e29b-41d4-a716-446655440001');
  const userId = ApplicantId('550e8400-e29b-41d4-a716-446655440003');
  const applicantId = ApplicantId('550e8400-e29b-41d4-a716-446655440005');
  const creatorId = UserId('550e8400-e29b-41d4-a716-446655440006');
  const projectId = ProjectId('550e8400-e29b-41d4-a716-446655440000');
  const deliveryDate = new Date('2026-12-31');

  const discovery = new DiscoverySubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
    taskId,
    idUser: userId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const design = new DesignSubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440009'),
    taskId,
    idUser: userId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const diagram = new DiagramSubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440011'),
    taskId,
    idUser: userId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const baseTask = () =>
    new Task({
      id: taskId,
      projectId,
      name: 'Task 01',
      description: 'Task description',
      taskNumber: '#20260001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      applicantId,
      creatorId,
    });

  it('should create a new task with subtasks', () => {
    const task = new Task({
      id: taskId,
      projectId,
      name: 'Task 01',
      description: 'Task description',
      taskNumber: '#20260001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      applicantId,
      creatorId,
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
    expect(task.getTaskNumber()).toBe('#20260001');
    expect(task.getPriority()).toBe(TaskPriority.MEDIA);
    expect(task.getApplicantId()).toBe(applicantId);
    expect(task.getCreatorId()).toBe(creatorId);
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
    task.changeTaskNumber('#20260002');
    expect(task.getTaskNumber()).toBe('#20260002');
  });

  it('should change priority correctly', () => {
    const task = baseTask();
    task.changePriority(TaskPriority.ALTA);
    expect(task.getPriority()).toBe(TaskPriority.ALTA);
  });

  it('should change applicantId correctly', () => {
    const task = baseTask();
    const newApplicantId = ApplicantId('550e8400-e29b-41d4-a716-446655440004');
    task.changeApplicantId(newApplicantId);
    expect(task.getApplicantId()).toBe(newApplicantId);
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

  describe('assertCanBeDeleted()', () => {
    it('should allow deletion when task has no subtasks', () => {
      const task = baseTask();
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should allow deletion when all subtasks are NAO_INICIADO', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440020'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: deliveryDate,
      }));
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should allow deletion when all subtasks are REPROVADO regardless of task status', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440021'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: deliveryDate,
      }));
      task.getSubTasks()[0].reject('Motivo de reprovação');
      task.changeStatus(TaskStatus.EM_EXECUCAO);
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should throw when task is not BACKLOG and has EM_PROGRESSO subtask', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440022'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: deliveryDate,
      }));
      expect(() => task.assertCanBeDeleted()).toThrow(
        'Task não pode ser removida pois possui subtasks ativas',
      );
    });

    it('should throw when task is not BACKLOG and has APROVADO subtask', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440023'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: deliveryDate,
      }));
      task.getSubTasks()[0].approve();
      expect(() => task.assertCanBeDeleted()).toThrow(
        'Task não pode ser removida pois possui subtasks ativas',
      );
    });

    it('should allow deletion when all subtasks are CANCELADO', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440026'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: deliveryDate,
      }));
      task.getSubTasks()[0].cancel('Motivo de cancelamento');
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should allow deletion when subtasks are mix of REPROVADO and CANCELADO', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440027'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: deliveryDate,
      }));
      task.addSubTask(new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440028'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: deliveryDate,
      }));
      task.getSubTasks()[0].reject('Motivo de reprovação');
      task.getSubTasks()[1].cancel('Motivo de cancelamento');
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should throw when task is not BACKLOG and subtasks are mixed (some REPROVADO, some not)', () => {
      const task = baseTask();
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440024'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: deliveryDate,
      }));
      task.addSubTask(new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440025'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: deliveryDate,
      }));
      task.getSubTasks()[0].reject('Motivo de reprovação');
      expect(() => task.assertCanBeDeleted()).toThrow(
        'Task não pode ser removida pois possui subtasks ativas',
      );
    });
  });
});
