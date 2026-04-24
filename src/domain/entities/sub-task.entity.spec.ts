import {
  SubTaskStatus,
  SubTaskType,
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  Level,
  Frequency,
  DiscoveryFieldEntry,
} from './sub-task.entity';
import { Design } from '../value-objects/design.vo';
import { Diagram } from '../value-objects/diagram.vo';
import { SubTaskId, TaskId, DesignId, ApplicantId, UserId } from '../shared/entity-ids';

const userId = UserId('550e8400-e29b-41d4-a716-446655440003');
const diagramUser = ApplicantId('550e8400-e29b-41d4-a716-446655440003');
const taskId = TaskId('550e8400-e29b-41d4-a716-446655440001');

const entry = <T>(value: T): DiscoveryFieldEntry<T> => ({
  value,
  userId,
  filledAt: new Date('2026-04-21'),
});

const fullDiscoveryForm = {
  complexity: entry(Level.HIGH),
  projectName: entry('Coilab'),
  summary: entry('Resumo do projeto'),
  painPoints: entry('Dificuldade em gerenciar tarefas'),
  frequency: entry(Frequency.DAILY),
  currentProcess: entry('Processo manual'),
  inactionCost: entry('R$ 10.000/mês'),
  volume: entry('500 requisições/dia'),
  avgTime: entry('30 minutos'),
  humanDependency: entry(Level.MEDIUM),
  rework: entry('20% das entregas'),
  previousAttempts: entry('Tentativa com Jira'),
  benchmark: entry('Linear, Jira'),
  institutionalPriority: entry(Level.HIGH),
  technicalOpinion: entry('Viável com 3 sprints'),
};

describe('SubTask Entity', () => {
  it('should create a subtask with common properties', () => {
    const subTask = new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date('2026-12-31'),
    });

    expect(subTask.getStatus()).toBe(SubTaskStatus.NAO_INICIADO);
    expect(subTask.getExpectedDelivery()).toBeInstanceOf(Date);
    expect(subTask.getStartDate()).toBeUndefined();
    expect(subTask.getIdUser()).toBe(userId);
    expect(subTask.getCreatedAt()).toBeInstanceOf(Date);
  });

  it('should start subtask correctly', () => {
    const subTask = new DiscoverySubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
    });

    subTask.start();
    expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
    expect(subTask.getStartDate()).toBeInstanceOf(Date);
  });

  describe('DiscoverySubTask', () => {
    it('should create with type DISCOVERY', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      expect(subTask.getType()).toBe(SubTaskType.DISCOVERY);
    });

    it('should create with form fields pre-filled as DiscoveryFieldEntry', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
        ...fullDiscoveryForm,
      });

      expect(subTask.getForm().complexity?.value).toBe(Level.HIGH);
      expect(subTask.getForm().complexity?.userId).toBe(userId);
      expect(subTask.getForm().projectName?.value).toBe('Coilab');
      expect(subTask.getForm().frequency?.value).toBe(Frequency.DAILY);
    });

    it('should allow partial form when status is EM_PROGRESSO', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
        complexity: entry(Level.LOW),
      });

      expect(subTask.getForm().complexity?.value).toBe(Level.LOW);
      expect(subTask.getForm().summary).toBeUndefined();
    });

    it('should update form fields recording userId and filledAt', () => {
      const otherUser = UserId('550e8400-e29b-41d4-a716-446655440099');
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      subTask.updateForm({ projectName: 'Coilab', complexity: Level.MEDIUM }, otherUser);
      expect(subTask.getForm().projectName?.value).toBe('Coilab');
      expect(subTask.getForm().projectName?.userId).toBe(otherUser);
      expect(subTask.getForm().projectName?.filledAt).toBeInstanceOf(Date);
      expect(subTask.getForm().complexity?.value).toBe(Level.MEDIUM);
    });

    it('should skip fields with undefined value in updateForm', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
        projectName: { value: 'Original', userId, filledAt: new Date() },
      });

      subTask.updateForm({ projectName: undefined, summary: 'Novo' }, userId);

      expect(subTask.getForm().projectName?.value).toBe('Original');
      expect(subTask.getForm().summary?.value).toBe('Novo');
    });

    it('should throw when updating form on locked subtask', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.updateForm({ projectName: 'Test' }, userId)).toThrow(
        `Subtask com status "${SubTaskStatus.AGUARDANDO_CHECKOUT}" não pode ser modificada`,
      );
    });

    it('should complete when all form fields are filled', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
        ...fullDiscoveryForm,
      });

      subTask.complete();
      expect(subTask.getStatus()).toBe(SubTaskStatus.AGUARDANDO_CHECKOUT);
      expect(subTask.getCompletionDate()).toBeInstanceOf(Date);
    });

    it('should throw when completing with missing form fields', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
        complexity: entry(Level.HIGH),
      });

      expect(() => subTask.complete()).toThrow('Campos obrigatórios não preenchidos:');
    });
  });

  const validDesign = new Design({
    id: DesignId('550e8400-e29b-41d4-a716-446655440050'),
    title: 'Mobile Home',
    description: 'Desc',
    urlImage: 'https://example.com/img.png',
    user: ApplicantId('550e8400-e29b-41d4-a716-446655440003'),
    dateUpload: new Date('2026-04-21'),
  });

  it('should create DesignSubTask with designs', () => {
    const subTask = new DesignSubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
      designs: [validDesign],
    });

    expect(subTask.getDesigns()).toHaveLength(1);
    expect(subTask.getType()).toBe(SubTaskType.DESIGN);
  });

  describe('DesignSubTask', () => {
    it('should add a design', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      subTask.addDesign(validDesign);
      expect(subTask.getDesigns()).toHaveLength(1);
    });

    it('should remove a design by id', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
        designs: [validDesign],
      });

      subTask.removeDesign(validDesign.getId());
      expect(subTask.getDesigns()).toHaveLength(0);
    });

    it('should throw when removing a design that does not exist', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.removeDesign(DesignId('550e8400-e29b-41d4-a716-446655440099'))).toThrow(
        'Design com id 550e8400-e29b-41d4-a716-446655440099 não encontrado',
      );
    });

    it('should throw on complete when no designs', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.complete()).toThrow('É necessário ao menos uma imagem');
    });

    it('should complete when at least one design exists', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
        designs: [validDesign],
      });

      expect(() => subTask.complete()).not.toThrow();
      expect(subTask.getStatus()).toBe(SubTaskStatus.AGUARDANDO_CHECKOUT);
    });
  });

  it('should create DiagramSubTask with diagrams', () => {
    const diagram = new Diagram({
      title: 'Database Diagram',
      description: 'Desc',
      urlDiagram: 'https://example.com/diagram.png',
      user: diagramUser,
      dateUpload: new Date(),
    });

    const subTask = new DiagramSubTask({
      id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
      taskId,
      idUser: userId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
      diagrams: [diagram],
    });

    expect(subTask.getDiagrams()).toHaveLength(1);
    expect(subTask.getDiagrams()[0].getTitle()).toBe('Database Diagram');
    expect(subTask.getType()).toBe(SubTaskType.DIAGRAM);
  });

  describe('DiagramSubTask', () => {
    it('should add a diagram', () => {
      const subTask = new DiagramSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      subTask.addDiagram(
        new Diagram({
          title: 'New Diagram',
          description: 'Desc',
          urlDiagram: 'https://example.com/diagram.png',
          user: diagramUser,
          dateUpload: new Date(),
        }),
      );
      expect(subTask.getDiagrams()).toHaveLength(1);
    });

    it('should remove a diagram by title', () => {
      const diagram = new Diagram({
        title: 'Database Diagram',
        description: 'Desc',
        urlDiagram: 'https://example.com/diagram.png',
        user: diagramUser,
        dateUpload: new Date(),
      });

      const subTask = new DiagramSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
        diagrams: [diagram],
      });

      subTask.removeDiagram('Database Diagram');
      expect(subTask.getDiagrams()).toHaveLength(0);
    });

    it('should throw when removing a diagram that does not exist', () => {
      const subTask = new DiagramSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.removeDiagram('Nonexistent')).toThrow(
        'Diagram com título "Nonexistent" não encontrado',
      );
    });
  });

  describe('assertEditable()', () => {
    const lockedStatuses = [
      SubTaskStatus.AGUARDANDO_CHECKOUT,
      SubTaskStatus.APROVADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];

    it.each(lockedStatuses)('should throw when trying to addDesign with status "%s"', (status) => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.addDesign(validDesign)).toThrow(
        `Subtask com status "${status}" não pode ser modificada`,
      );
    });

    it.each(lockedStatuses)(
      'should throw when trying to removeDesign with status "%s"',
      (status) => {
        const subTask = new DesignSubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
          taskId,
          idUser: userId,
          status,
          expectedDelivery: new Date(),
        });

        expect(() =>
          subTask.removeDesign(DesignId('550e8400-e29b-41d4-a716-446655440099')),
        ).toThrow(`Subtask com status "${status}" não pode ser modificada`);
      },
    );

    it('should allow addDesign when status is NAO_INICIADO', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.addDesign(validDesign)).not.toThrow();
    });

    it('should allow addDesign when status is EM_PROGRESSO', () => {
      const subTask = new DesignSubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440008'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.addDesign(validDesign)).not.toThrow();
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
        const subTask = new DiscoverySubTask({
          id: SubTaskId('550e8400-e29b-41d4-a716-446655440050'),
          taskId,
          idUser: userId,
          status,
          expectedDelivery: new Date(),
        });
        subTask.cancel('Motivo de cancelamento');
        expect(subTask.getStatus()).toBe(SubTaskStatus.CANCELADO);
        expect(subTask.getReason()).toBe('Motivo de cancelamento');
      }
    });

    it('should throw when trying to cancel an APROVADO subtask', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440051'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });
      subTask.approve();
      expect(() => subTask.cancel('Motivo')).toThrow(
        'A subtask já foi aprovada e não pode ser cancelada',
      );
    });
  });

  describe('approve()', () => {
    it('should approve when subtask is AGUARDANDO_CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440030'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      subTask.approve();
      expect(subTask.getStatus()).toBe(SubTaskStatus.APROVADO);
    });

    it('should throw if subtask is not AGUARDANDO_CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440031'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.approve()).toThrow(
        'A subtask precisa estar Aguardando Checkout para ser aprovada',
      );
    });
  });

  describe('reject()', () => {
    it('should reject when subtask is AGUARDANDO_CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440033'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      subTask.reject('Motivo de reprovação');
      expect(subTask.getStatus()).toBe(SubTaskStatus.REPROVADO);
      expect(subTask.getReason()).toBe('Motivo de reprovação');
    });

    it('should throw if subtask is not AGUARDANDO_CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440034'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.reject('Motivo de reprovação')).toThrow(
        'A subtask precisa estar Aguardando Checkout para ser reprovada',
      );
    });
  });

  describe('Frequency enum', () => {
    it.each([
      [Frequency.DAILY, 'Diária'],
      [Frequency.WEEKLY, 'Semanal'],
      [Frequency.MONTHLY, 'Mensal'],
      [Frequency.OCCASIONAL, 'Eventual'],
    ])('%s has correct value', (value, expected) => {
      expect(value).toBe(expected);
    });
  });

  describe('updateStatus()', () => {
    it('should update status directly', () => {
      const subTask = new DiscoverySubTask({
        id: SubTaskId('550e8400-e29b-41d4-a716-446655440040'),
        taskId,
        idUser: userId,
        status: SubTaskStatus.NAO_INICIADO,
        expectedDelivery: new Date(),
      });

      subTask.updateStatus(SubTaskStatus.EM_PROGRESSO);
      expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
    });
  });

  it('should expose getId and getTaskId correctly', () => {
    const id = SubTaskId('550e8400-e29b-41d4-a716-446655440041');
    const subTask = new DiscoverySubTask({
      id,
      taskId,
      idUser: userId,
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
    });

    expect(subTask.getId()).toBe(id);
    expect(subTask.getTaskId()).toBe(taskId);
  });
});
