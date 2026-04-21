import { Task, TaskPriority, TaskStatus } from './task.entity';
import { DiscoverySubTask, DesignSubTask, SubTaskStatus } from './sub-task.entity';

describe('Task Status Transition Rules', () => {
  const taskId = '550e8400-e29b-41d4-a716-446655440001';
  const deliveryDate = new Date('2026-12-31');

  it('should allow checkout if task has no subtasks', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should allow checkout if all subtasks are awaiting checkout', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const discovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440012',
      taskId,
      status: SubTaskStatus.AGUARDANDO_CHECKOUT,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(discovery);
    task.changeStatus(TaskStatus.CHECKOUT);

    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should NOT allow checkout if a subtask is in progress (should move to EM_EXECUCAO)', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const discovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440012',
      taskId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(discovery);
    task.changeStatus(TaskStatus.CHECKOUT);

    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('should allow checkout if one subtask is reproved but another of the same phase is awaiting checkout', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const reprovedDiscovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440013',
      taskId,
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: deliveryDate,
    });

    const awaitingDiscovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440014',
      taskId,
      status: SubTaskStatus.AGUARDANDO_CHECKOUT,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(reprovedDiscovery);
    task.addSubTask(awaitingDiscovery);

    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should NOT allow checkout if a subtask is reproved and there is no substitute awaiting checkout', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const reprovedDiscovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440013',
      taskId,
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(reprovedDiscovery);
    task.changeStatus(TaskStatus.CHECKOUT);

    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('should NOT allow adding a second subtask of the same type if the previous is not reproved', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const design1 = new DesignSubTask({
      id: '550e8400-e29b-41d4-a716-446655440020',
      taskId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: deliveryDate,
    });

    const design2 = new DesignSubTask({
      id: '550e8400-e29b-41d4-a716-446655440021',
      taskId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(design1);
    expect(() => task.addSubTask(design2)).toThrow();
  });

  it('should allow adding a second subtask of the same type if the previous is reproved', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const design1 = new DesignSubTask({
      id: '550e8400-e29b-41d4-a716-446655440022',
      taskId,
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: deliveryDate,
    });

    const design2 = new DesignSubTask({
      id: '550e8400-e29b-41d4-a716-446655440023',
      taskId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(design1);
    expect(() => task.addSubTask(design2)).not.toThrow();
    expect(task.getSubTasks()).toHaveLength(2);
  });

  it('should allow adding a first subtask of any type freely', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const discovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440024',
      taskId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: deliveryDate,
    });

    expect(() => task.addSubTask(discovery)).not.toThrow();
  });

  it('should move from BACKLOG to EM_EXECUCAO automatically if a subtask starts', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
    });

    const discovery = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440012',
      taskId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: deliveryDate,
    });

    task.addSubTask(discovery);
    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });
});