import { SubTask, SubTaskStatus } from './sub-task.entity';
import { SubTaskId, TaskId, UserId, TaskToolId } from '../shared/entity-ids';
import { randomUUID } from 'crypto';

const userId = UserId('550e8400-e29b-41d4-a716-446655440003');
const taskId = TaskId('550e8400-e29b-41d4-a716-446655440001');

const makeSubTask = (
  overrides: Partial<{
    id: ReturnType<typeof SubTaskId>;
    status: SubTaskStatus;
    typeId: ReturnType<typeof TaskToolId>;
    metadata: Record<string, unknown>;
  }> = {},
) =>
  new SubTask({
    id: overrides.id ?? SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
    taskId,
    idUser: userId,
    status: overrides.status ?? SubTaskStatus.NAO_INICIADO,
    typeId: overrides.typeId ?? TaskToolId(1),
    expectedDelivery: new Date('2026-12-31'),
    metadata: overrides.metadata,
  });

describe('SubTask Entity', () => {
  it('should create a subtask with common properties', () => {
    const subTask = makeSubTask();

    expect(subTask.getStatus()).toBe(SubTaskStatus.NAO_INICIADO);
    expect(subTask.getExpectedDelivery()).toBeInstanceOf(Date);
    expect(subTask.getStartDate()).toBeUndefined();
    expect(subTask.getIdUser()).toBe(userId);
    expect(subTask.getCreatedAt()).toBeInstanceOf(Date);
  });

  it('should expose typeId correctly', () => {
    const subTask = makeSubTask({ typeId: TaskToolId(1) });
    expect(subTask.getTypeId()).toBe(1);
  });

  it('should expose metadata as empty object by default', () => {
    const subTask = makeSubTask();
    expect(subTask.getMetadata()).toEqual({});
  });

  it('should store provided metadata', () => {
    const subTask = makeSubTask({ metadata: { key: 'value', count: 42 } });
    expect(subTask.getMetadata()).toEqual({ key: 'value', count: 42 });
  });

  it('should update metadata merging new fields', () => {
    const subTask = makeSubTask({ metadata: { a: 1 }, status: SubTaskStatus.NAO_INICIADO });
    subTask.updateMetadata({ b: 2 });
    expect(subTask.getMetadata()).toEqual({ a: 1, b: 2 });
  });

  it('should overwrite existing metadata keys on updateMetadata', () => {
    const subTask = makeSubTask({ metadata: { key: 'old' } });
    subTask.updateMetadata({ key: 'new' });
    expect(subTask.getMetadata().key).toBe('new');
  });

  it('should throw when updating metadata on a locked subtask', () => {
    const subTask = makeSubTask({ status: SubTaskStatus.AGUARDANDO_CHECKOUT });
    expect(() => subTask.updateMetadata({ foo: 'bar' })).toThrow(
      `Subtask com status "${SubTaskStatus.AGUARDANDO_CHECKOUT}" não pode ser modificada`,
    );
  });

  it('should start subtask correctly', () => {
    const subTask = makeSubTask();
    subTask.start();
    expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
    expect(subTask.getStartDate()).toBeInstanceOf(Date);
  });

  it('should complete subtask correctly', () => {
    const subTask = makeSubTask({ status: SubTaskStatus.EM_PROGRESSO });
    subTask.complete();
    expect(subTask.getStatus()).toBe(SubTaskStatus.AGUARDANDO_CHECKOUT);
    expect(subTask.getCompletionDate()).toBeInstanceOf(Date);
  });

  describe('approve()', () => {
    it('should approve when subtask is AGUARDANDO_CHECKOUT', () => {
      const subTask = makeSubTask({ status: SubTaskStatus.AGUARDANDO_CHECKOUT });
      subTask.approve();
      expect(subTask.getStatus()).toBe(SubTaskStatus.APROVADO);
    });

    it('should throw if subtask is not AGUARDANDO_CHECKOUT', () => {
      const subTask = makeSubTask({ status: SubTaskStatus.EM_PROGRESSO });
      expect(() => subTask.approve()).toThrow(
        'A subtask precisa estar Aguardando Checkout para ser aprovada',
      );
    });
  });

  describe('reject()', () => {
    it('should reject when subtask is AGUARDANDO_CHECKOUT', () => {
      const subTask = makeSubTask({ status: SubTaskStatus.AGUARDANDO_CHECKOUT });
      subTask.reject('Motivo de reprovação');
      expect(subTask.getStatus()).toBe(SubTaskStatus.REPROVADO);
      expect(subTask.getReason()).toBe('Motivo de reprovação');
    });

    it('should throw if subtask is not AGUARDANDO_CHECKOUT', () => {
      const subTask = makeSubTask({ status: SubTaskStatus.EM_PROGRESSO });
      expect(() => subTask.reject('Motivo')).toThrow(
        'A subtask precisa estar Aguardando Checkout para ser reprovada',
      );
    });
  });

  describe('cancel()', () => {
    it('should cancel subtask from any non-APROVADO status', () => {
      const statuses = [
        SubTaskStatus.NAO_INICIADO,
        SubTaskStatus.EM_PROGRESSO,
        SubTaskStatus.AGUARDANDO_CHECKOUT,
        SubTaskStatus.REPROVADO,
      ];

      for (const status of statuses) {
        const subTask = makeSubTask({ id: SubTaskId(randomUUID()), status });
        subTask.cancel('Motivo de cancelamento');
        expect(subTask.getStatus()).toBe(SubTaskStatus.CANCELADO);
        expect(subTask.getReason()).toBe('Motivo de cancelamento');
      }
    });

    it('should throw when trying to cancel an APROVADO subtask', () => {
      const subTask = makeSubTask({ status: SubTaskStatus.AGUARDANDO_CHECKOUT });
      subTask.approve();
      expect(() => subTask.cancel('Motivo')).toThrow(
        'A subtask já foi aprovada e não pode ser cancelada',
      );
    });
  });

  describe('updateStatus()', () => {
    it('should update status directly', () => {
      const subTask = makeSubTask();
      subTask.updateStatus(SubTaskStatus.EM_PROGRESSO);
      expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
    });
  });

  describe('assertEditable()', () => {
    const lockedStatuses = [
      SubTaskStatus.AGUARDANDO_CHECKOUT,
      SubTaskStatus.APROVADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];

    it.each(lockedStatuses)(
      'should throw when trying to updateMetadata with status "%s"',
      (status) => {
        const subTask = makeSubTask({ id: SubTaskId(randomUUID()), status });
        expect(() => subTask.updateMetadata({ x: 1 })).toThrow(
          `Subtask com status "${status}" não pode ser modificada`,
        );
      },
    );
  });

  it('should expose getId and getTaskId correctly', () => {
    const id = SubTaskId('550e8400-e29b-41d4-a716-446655440041');
    const subTask = new SubTask({
      id,
      taskId,
      idUser: userId,
      status: SubTaskStatus.NAO_INICIADO,
      typeId: TaskToolId(1),
      expectedDelivery: new Date(),
    });

    expect(subTask.getId()).toBe(id);
    expect(subTask.getTaskId()).toBe(taskId);
  });

  describe('typeId variants', () => {
    it.each([
      [1, 'Discovery'],
      [2, 'Design'],
      [3, 'Diagram'],
    ])('typeId %i is accepted', (typeId) => {
      const subTask = makeSubTask({ id: SubTaskId(randomUUID()), typeId: TaskToolId(typeId) });
      expect(subTask.getTypeId()).toBe(typeId);
    });
  });
});
