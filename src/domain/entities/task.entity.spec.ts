import { Task, TaskPriority, TaskStatus } from './task.entity';
import { SubTask, SubTaskStatus } from './sub-task.entity';
import {
  TaskId,
  ProjectId,
  SubTaskId,
  ApplicantId,
  UserId,
  FlowId,
  TaskToolId,
} from '../shared/entity-ids';

describe('Task Entity', () => {
  const taskId = TaskId('550e8400-e29b-41d4-a716-446655440001');
  const userId = UserId('550e8400-e29b-41d4-a716-446655440003');
  const applicantId = ApplicantId(1);
  const creatorId = UserId('550e8400-e29b-41d4-a716-446655440006');
  const projectId = ProjectId('550e8400-e29b-41d4-a716-446655440000');
  const deliveryDate = new Date('2026-12-31');

  const discovery = new SubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
    taskId,
    idUser: userId,
    status: SubTaskStatus.NAO_INICIADO,
    typeId: TaskToolId(1),
    taskNumber: '#20260001',
    expectedDelivery: deliveryDate,
  });

  const design = new SubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440009'),
    taskId,
    idUser: userId,
    status: SubTaskStatus.NAO_INICIADO,
    typeId: TaskToolId(2),
    taskNumber: '#20260002',
    expectedDelivery: deliveryDate,
  });

  const diagram = new SubTask({
    id: SubTaskId('550e8400-e29b-41d4-a716-446655440011'),
    taskId,
    idUser: userId,
    status: SubTaskStatus.NAO_INICIADO,
    typeId: TaskToolId(3),
    taskNumber: '#20260003',
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
    expect(task.getSubTasks().filter((s) => s.getTypeId() === 1)).toHaveLength(1);
    expect(task.getSubTasks().filter((s) => s.getTypeId() === 2)).toHaveLength(1);
    expect(task.getSubTasks().filter((s) => s.getTypeId() === 3)).toHaveLength(1);
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
    expect(task.getFlowIds()).toHaveLength(0);
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

  it('should change priority correctly', () => {
    const task = baseTask();
    task.changePriority(TaskPriority.ALTA);
    expect(task.getPriority()).toBe(TaskPriority.ALTA);
  });

  it('should change applicantId correctly', () => {
    const task = baseTask();
    const newApplicantId = ApplicantId(2);
    task.changeApplicantId(newApplicantId);
    expect(task.getApplicantId()).toBe(newApplicantId);
  });

  it('should add flow correctly', () => {
    const task = baseTask();
    const flowId = FlowId(1);
    task.addFlowId(flowId);
    expect(task.getFlowIds()).toHaveLength(1);
    expect(task.getFlowIds()[0]).toBe(flowId);
  });

  it('should throw when adding duplicate flowId', () => {
    const task = baseTask();
    const flowId = FlowId(1);
    task.addFlowId(flowId);
    expect(() => task.addFlowId(flowId)).toThrow('Flow já adicionado');
  });

  it('should throw when removing a subtask that does not exist', () => {
    const task = baseTask();
    expect(() => task.removeSubTask('non-existent-id')).toThrow('SubTask não encontrada');
  });

  describe('assertCanBeDeleted()', () => {
    it('should allow deletion when task has no subtasks', () => {
      const task = baseTask();
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should allow deletion when all subtasks are NAO_INICIADO', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440020'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.NAO_INICIADO,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should allow deletion when all subtasks are REPROVADO regardless of task status', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440021'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.AGUARDANDO_CHECKOUT,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.getSubTasks()[0].reject('Motivo de reprovação');
      task.changeStatus(TaskStatus.EM_EXECUCAO);
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should throw when task is not BACKLOG and has EM_PROGRESSO subtask', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440022'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.EM_PROGRESSO,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      expect(() => task.assertCanBeDeleted()).toThrow(
        'Task não pode ser removida pois possui subtasks ativas',
      );
    });

    it('should throw when task is not BACKLOG and has APROVADO subtask', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440023'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.AGUARDANDO_CHECKOUT,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.getSubTasks()[0].approve();
      expect(() => task.assertCanBeDeleted()).toThrow(
        'Task não pode ser removida pois possui subtasks ativas',
      );
    });

    it('should allow deletion when all subtasks are CANCELADO', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440026'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.EM_PROGRESSO,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.getSubTasks()[0].cancel('Motivo de cancelamento');
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should allow deletion when subtasks are mix of REPROVADO and CANCELADO', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440027'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.AGUARDANDO_CHECKOUT,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440028'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.EM_PROGRESSO,
          typeId: TaskToolId(2),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.getSubTasks()[0].reject('Motivo de reprovação');
      task.getSubTasks()[1].cancel('Motivo de cancelamento');
      expect(() => task.assertCanBeDeleted()).not.toThrow();
    });

    it('should throw when task is not BACKLOG and subtasks are mixed (some REPROVADO, some not)', () => {
      const task = baseTask();
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440024'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.AGUARDANDO_CHECKOUT,
          typeId: TaskToolId(1),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.addSubTask(
        new SubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440025'),
          taskId,
          idUser: userId,
          status: SubTaskStatus.EM_PROGRESSO,
          typeId: TaskToolId(2),
          taskNumber: '#20260001',
          expectedDelivery: deliveryDate,
        }),
      );
      task.getSubTasks()[0].reject('Motivo de reprovação');
      expect(() => task.assertCanBeDeleted()).toThrow(
        'Task não pode ser removida pois possui subtasks ativas',
      );
    });
  });

  describe('changeStatus() → DESENVOLVIMENTO guard', () => {
    const makeSubTask = (
      id: string,
      typeId: number,
      status: SubTaskStatus,
      taskNumber: string,
    ) =>
      new SubTask({
        id: SubTaskId(id),
        taskId,
        idUser: userId,
        status,
        typeId: TaskToolId(typeId),
        taskNumber,
        expectedDelivery: deliveryDate,
      });

    it('allows DESENVOLVIMENTO when task has no subtasks', () => {
      const task = baseTask();
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).not.toThrow();
      expect(task.getStatus()).toBe(TaskStatus.DESENVOLVIMENTO);
    });

    it('allows DESENVOLVIMENTO when all subtasks are APROVADO', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440030', 1, SubTaskStatus.AGUARDANDO_CHECKOUT, '#20260010'));
      task.getSubTasks()[0].approve();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440031', 2, SubTaskStatus.AGUARDANDO_CHECKOUT, '#20260011'));
      task.getSubTasks()[1].approve();
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).not.toThrow();
    });

    it('allows DESENVOLVIMENTO when REPROVADO has substituta APROVADA do mesmo tipo', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440032', 1, SubTaskStatus.AGUARDANDO_CHECKOUT, '#20260012'));
      task.getSubTasks()[0].reject('Reprovado');
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440033', 1, SubTaskStatus.AGUARDANDO_CHECKOUT, '#20260013'));
      task.getSubTasks()[1].approve();
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).not.toThrow();
    });

    it('allows DESENVOLVIMENTO when only CANCELADO subtasks exist', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440034', 1, SubTaskStatus.EM_PROGRESSO, '#20260014'));
      task.getSubTasks()[0].cancel('Cancelado');
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).not.toThrow();
    });

    it('blocks DESENVOLVIMENTO when subtask is EM_PROGRESSO', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440035', 1, SubTaskStatus.EM_PROGRESSO, '#20260015'));
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).toThrow('Para ir para Desenvolvimento');
    });

    it('blocks DESENVOLVIMENTO when subtask is NAO_INICIADO', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440036', 1, SubTaskStatus.NAO_INICIADO, '#20260016'));
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).toThrow('Para ir para Desenvolvimento');
    });

    it('blocks DESENVOLVIMENTO when subtask is AGUARDANDO_CHECKOUT', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440037', 1, SubTaskStatus.AGUARDANDO_CHECKOUT, '#20260017'));
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).toThrow('Para ir para Desenvolvimento');
    });

    it('blocks DESENVOLVIMENTO when REPROVADO has no substituta APROVADA', () => {
      const task = baseTask();
      task.addSubTask(makeSubTask('550e8400-e29b-41d4-a716-446655440038', 1, SubTaskStatus.AGUARDANDO_CHECKOUT, '#20260018'));
      task.getSubTasks()[0].reject('Reprovado');
      expect(() => task.changeStatus(TaskStatus.DESENVOLVIMENTO)).toThrow('Para ir para Desenvolvimento');
    });
  });
});
