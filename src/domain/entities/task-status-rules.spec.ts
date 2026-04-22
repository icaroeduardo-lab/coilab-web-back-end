import { Task, TaskPriority, TaskStatus } from './task.entity';
import { DiscoverySubTask, DesignSubTask, SubTaskStatus } from './sub-task.entity';
import { TaskId, ProjectId, SubTaskId, ApplicantId, UserId } from '../shared/entity-ids';

describe('Task Status Transition Rules', () => {
  const userId = ApplicantId('550e8400-e29b-41d4-a716-446655440003');
  const taskId = TaskId('550e8400-e29b-41d4-a716-446655440001');
  const deliveryDate = new Date('2026-12-31');

  const baseTask = () =>
    new Task({
      id: taskId,
      projectId: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      name: 'Task 01',
      description: 'Desc',
      taskNumber: '#20260001',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.BACKLOG,
      applicantId: ApplicantId('550e8400-e29b-41d4-a716-446655440005'),
      creatorId: UserId('550e8400-e29b-41d4-a716-446655440006'),
    });

  it('should allow checkout if task has no subtasks', () => {
    const task = baseTask();
    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should allow checkout if all subtasks are AGUARDANDO_CHECKOUT', () => {
    const task = baseTask();
    task.addSubTask(new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440012'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.AGUARDANDO_CHECKOUT,
      expectedDelivery: deliveryDate,
    }));
    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should allow checkout if subtask was manually approved (all APROVADO, no REPROVADO)', () => {
    const task = baseTask();
    const subtask = new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440013'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.AGUARDANDO_CHECKOUT,
      expectedDelivery: deliveryDate,
    });
    task.addSubTask(subtask);
    subtask.approve();
    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should NOT allow checkout if a subtask is EM_PROGRESSO', () => {
    const task = baseTask();
    task.addSubTask(new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440012'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: deliveryDate,
    }));
    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('should allow checkout if one subtask is REPROVADO and another of same type is AGUARDANDO_CHECKOUT', () => {
    const task = baseTask();
    task.addSubTask(new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440013'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: deliveryDate,
    }));
    task.addSubTask(new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440014'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.AGUARDANDO_CHECKOUT,
      expectedDelivery: deliveryDate,
    }));
    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.CHECKOUT);
  });

  it('should NOT allow checkout if a subtask is REPROVADO with no substitute AGUARDANDO_CHECKOUT', () => {
    const task = baseTask();
    task.addSubTask(new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440013'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: deliveryDate,
    }));
    task.changeStatus(TaskStatus.CHECKOUT);
    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });

  it('should NOT allow adding a second subtask of the same type if the previous is not REPROVADO', () => {
    const task = baseTask();
    task.addSubTask(new DesignSubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440020'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: deliveryDate,
    }));
    expect(() =>
      task.addSubTask(new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440021'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: deliveryDate,
      })),
    ).toThrow();
  });

  it('should allow adding a second subtask of the same type if the previous is REPROVADO', () => {
    const task = baseTask();
    task.addSubTask(new DesignSubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440022'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.REPROVADO,
      expectedDelivery: deliveryDate,
    }));
    expect(() =>
      task.addSubTask(new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440023'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: deliveryDate,
      })),
    ).not.toThrow();
  });

  it('should allow adding first subtask of any type freely', () => {
    const task = baseTask();
    expect(() =>
      task.addSubTask(new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440024'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: deliveryDate,
      })),
    ).not.toThrow();
  });

  it('should move from BACKLOG to EM_EXECUCAO automatically when subtask starts', () => {
    const task = baseTask();
    task.addSubTask(new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440012'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: deliveryDate,
    }));
    expect(task.getStatus()).toBe(TaskStatus.EM_EXECUCAO);
  });
});
