import {
  SubTask,
  SubTaskStatus,
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  SubTaskType,
} from './sub-task.entity';
import { Discovery } from '../value-objects/discovery.vo';
import { Design } from '../value-objects/design.vo';
import { Diagram } from '../value-objects/diagram.vo';

describe('SubTask Entity', () => {
  it('should create a subtask with common properties', () => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      type: SubTaskType.DISCOVERY,
      expectedDelivery: new Date('2026-12-31'),
    };

    const subTask = new SubTask(props);

    expect(subTask.getStatus()).toBe(SubTaskStatus.NAO_INICIADO);
    expect(subTask.getExpectedDelivery()).toBeInstanceOf(Date);
    expect(subTask.getStartDate()).toBeUndefined();
  });

  it('should start subtask correctly', () => {
    const subTask = new SubTask({
      id: '550e8400-e29b-41d4-a716-446655440008',
      taskId: '550e8400-e29b-41d4-a716-446655440001',
      status: SubTaskStatus.NAO_INICIADO,
      type: SubTaskType.DISCOVERY,
      expectedDelivery: new Date(),
    });

    subTask.start();
    expect(subTask.getStatus()).toBe(SubTaskStatus.EM_PROGRESSO);
    expect(subTask.getStartDate()).toBeInstanceOf(Date);
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
});