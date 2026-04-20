import { Task, TaskPriority, TaskStatus } from './task.entity';
import { DiscoverySubTask, DesignSubTask, DiagramSubTask, SubTaskStatus } from './sub-task.entity';

describe('Task Entity', () => {
  const taskId = '550e8400-e29b-41d4-a716-446655440001';
  const deliveryDate = new Date('2026-12-31');

  const discovery = new DiscoverySubTask({
    id: '550e8400-e29b-41d4-a716-446655440008',
    taskId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const design = new DesignSubTask({
    id: '550e8400-e29b-41d4-a716-446655440009',
    taskId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  const diagram = new DiagramSubTask({
    id: '550e8400-e29b-41d4-a716-446655440011',
    taskId,
    status: SubTaskStatus.NAO_INICIADO,
    expectedDelivery: deliveryDate,
  });

  it('should create a new task with subtasks', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Task description',
      taskNumber: 'T-001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      subTasks: [discovery, design, diagram],
    });

    expect(task.getStatus()).toBe(TaskStatus.BACKLOG);
    expect(task.getSubTasks()).toHaveLength(3);
    expect(task.getDiscovery()).toHaveLength(1);
  });

  it('should change status correctly', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.BAIXA,
      status: TaskStatus.BACKLOG,
      subTasks: [discovery],
    });

    task.changeStatus(TaskStatus.EM_EXECUCAO);
    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('should change task number correctly', () => {
    const task = new Task({
      id: taskId,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.BAIXA,
      status: TaskStatus.BACKLOG,
      subTasks: [],
    });

    task.changeTaskNumber('T-002');
    expect(task.getTaskNumber()).toBe('T-002');
  });
});