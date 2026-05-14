import { Canvas, Project, ProjectStatus } from './project.entity';
import { ProjectId } from '../shared/entity-ids';

describe('Project Entity', () => {
  const baseProps = {
    id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
    projectNumber: '#20260001',
    name: 'Project Alpha',
    description: 'Test description',
  };

  it('should create a new project with all properties', () => {
    const project = new Project({
      ...baseProps,
      status: ProjectStatus.BACKLOG,
      createdAt: new Date(),
    });

    expect(project.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should change name correctly', () => {
    const project = new Project({ ...baseProps, name: 'Old Name' });
    project.changeName('New Name');
    expect(project.getName()).toBe('New Name');
  });

  it('should throw error when changing to an invalid name', () => {
    const project = new Project(baseProps);
    expect(() => project.changeName('')).toThrow('Validation failed: name should not be empty');
  });

  it('should update status', () => {
    const project = new Project(baseProps);
    project.updateStatus(ProjectStatus.EM_EXECUCAO);
    expect(project.getStatus()).toBe(ProjectStatus.EM_EXECUCAO);
  });

  it('should change description correctly', () => {
    const project = new Project({ ...baseProps, description: 'Old desc' });
    project.changeDescription('New desc');
    expect(project.getDescription()).toBe('New desc');
  });

  it('should expose all getters correctly', () => {
    const project = new Project(baseProps);

    expect(project.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(project.getProjectNumber()).toBe('#20260001');
    expect(project.getDescription()).toBe('Test description');
    expect(project.getCanvas()).toBeUndefined();
    expect(project.getCreatedAt()).toBeInstanceOf(Date);
  });

  describe('canvas', () => {
    const canvas: Canvas = {
      problem: 'Falta de visibilidade no pipeline',
      target: ['Time de produto', 'Stakeholders'],
      objective: ['Aumentar transparência', 'Reduzir retrabalho'],
      impact: {
        description: 'Melhoria no time-to-market',
        labels: ['eficiência', 'qualidade'],
      },
      parts: [{ name: 'Produto', role: 'Responsável' }],
      resources: [{ type: 'humano', description: ['Dev', 'Designer'] }],
      risksAndMitigation: [{ risk: 'Atraso', mitigation: 'Buffer de sprint' }],
      indicators: ['NPS', 'Cycle time'],
      team: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      notes: 'Revisar após kickoff',
    };

    it('should create project with canvas', () => {
      const project = new Project({ ...baseProps, canvas });
      expect(project.getCanvas()).toEqual(canvas);
    });

    it('should update canvas', () => {
      const project = new Project(baseProps);
      expect(project.getCanvas()).toBeUndefined();

      project.updateCanvas(canvas);
      expect(project.getCanvas()).toEqual(canvas);
    });

    it('should partially update canvas', () => {
      const project = new Project({ ...baseProps, canvas });
      const updated: Canvas = { ...canvas, problem: 'Novo problema' };
      project.updateCanvas(updated);
      expect(project.getCanvas()?.problem).toBe('Novo problema');
    });

    it('should allow canvas with only some fields', () => {
      const project = new Project({ ...baseProps, canvas: { problem: 'só problema' } });
      expect(project.getCanvas()?.problem).toBe('só problema');
      expect(project.getCanvas()?.target).toBeUndefined();
    });
  });
});
