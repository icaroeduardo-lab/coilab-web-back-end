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