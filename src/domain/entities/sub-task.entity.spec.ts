import {
  SubTaskStatus,
  SubTaskType,
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
} from './sub-task.entity';
import { Discovery } from '../value-objects/discovery.vo';
import { Design } from '../value-objects/design.vo';
import { Diagram } from '../value-objects/diagram.vo';
import { TaskStatus } from './task-status.enum';

describe('SubTask Entity', () => {
  it('should create a subtask with common properties', () => {
    const subTask = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date('2026-12-31'),
    });

    expect(subTask.getStatus()).toBe(SubTaskStatus.NAO_INICIADO);
    expect(subTask.getExpectedDelivery()).toBeInstanceOf(Date);
    expect(subTask.getStartDate()).toBeUndefined();
  });

  it('should start subtask correctly', () => {
    const subTask = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
    });

    subTask.start();
    expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
    expect(subTask.getStartDate()).toBeInstanceOf(Date);
  });

  it('should move to AGUARDANDO_CHECKOUT when complete() is called', () => {
    const subTask = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.EM_PROGRESSO,
      expectedDelivery: new Date(),
    });

    subTask.complete();
    expect(subTask.getStatus()).toBe(SubTaskStatus.AGUARDANDO_CHECKOUT);
    expect(subTask.getCompletionDate()).toBeInstanceOf(Date);
  });

  it('should create DiscoverySubTask with discoveries', () => {
    const discovery = new Discovery({
      title: 'Research',
      description: 'Desc',
      urlResearch: 'https://example.com',
    });

    const subTask = new DiscoverySubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
      discoveries: [discovery],
    });

    expect(subTask.getDiscoveries()).toHaveLength(1);
    expect(subTask.getDiscoveries()[0].getTitle()).toBe('Research');
    expect(subTask.getType()).toBe(SubTaskType.DISCOVERY);
  });

  it('should create DesignSubTask with designs', () => {
    const design = new Design({
      title: 'Mobile Home',
      description: 'Desc',
      urlImage: 'https://example.com/img.png',
    });

    const subTask = new DesignSubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
      designs: [design],
    });

    expect(subTask.getDesigns()).toHaveLength(1);
    expect(subTask.getType()).toBe(SubTaskType.DESIGN);
  });

  it('should create DiagramSubTask with diagrams', () => {
    const diagram = new Diagram({
      title: 'Database Diagram',
      description: 'Desc',
      urlDiagram: 'https://example.com/diagram.png',
    });

    const subTask = new DiagramSubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      expectedDelivery: new Date(),
      diagrams: [diagram],
    });

    expect(subTask.getDiagrams()).toHaveLength(1);
    expect(subTask.getDiagrams()[0].getTitle()).toBe('Database Diagram');
    expect(subTask.getType()).toBe(SubTaskType.DIAGRAM);
  });

  describe('approve()', () => {
    it('should approve when subtask is AGUARDANDO_CHECKOUT and task is CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: '550e8400-e29b-41d4-a716-446655440030',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      subTask.approve(TaskStatus.CHECKOUT);
      expect(subTask.getStatus()).toBe(SubTaskStatus.APROVADO);
    });

    it('should throw if subtask is not AGUARDANDO_CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: '550e8400-e29b-41d4-a716-446655440031',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.approve(TaskStatus.CHECKOUT)).toThrow(
        'A subtask precisa estar Aguardando Checkout para ser aprovada',
      );
    });

    it('should throw if task is not in CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: '550e8400-e29b-41d4-a716-446655440032',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.approve(TaskStatus.EM_EXECUCAO)).toThrow(
        'A task precisa estar em Checkout para aprovar uma subtask',
      );
    });
  });

  describe('reject()', () => {
    it('should reject when subtask is AGUARDANDO_CHECKOUT and task is CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: '550e8400-e29b-41d4-a716-446655440033',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      subTask.reject(TaskStatus.CHECKOUT);
      expect(subTask.getStatus()).toBe(SubTaskStatus.REPROVADO);
    });

    it('should throw if subtask is not AGUARDANDO_CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: '550e8400-e29b-41d4-a716-446655440034',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        status: SubTaskStatus.EM_PROGRESSO,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.reject(TaskStatus.CHECKOUT)).toThrow(
        'A subtask precisa estar Aguardando Checkout para ser reprovada',
      );
    });

    it('should throw if task is not in CHECKOUT', () => {
      const subTask = new DiscoverySubTask({
        id: '550e8400-e29b-41d4-a716-446655440035',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        status: SubTaskStatus.AGUARDANDO_CHECKOUT,
        expectedDelivery: new Date(),
      });

      expect(() => subTask.reject(TaskStatus.EM_EXECUCAO)).toThrow(
        'A task precisa estar em Checkout para reprovar uma subtask',
      );
    });
  });
});