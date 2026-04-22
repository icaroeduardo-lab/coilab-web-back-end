import { Project, ProjectStatus } from './project.entity';
import { ProjectId } from '../shared/entity-ids';

describe('Project Entity', () => {
  it('should create a new project with all properties', () => {
    const project = new Project({
      name: 'Project Alpha',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Test description',
      urlDocument: 'https://example.com/doc',
      status: ProjectStatus.BACKLOG,
      createdAt: new Date(),
    });

    expect(project.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should change name correctly', () => {
    const project = new Project({
      name: 'Old Name',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Desc',
    });

    project.changeName('New Name');
    expect(project.getName()).toBe('New Name');
  });

  it('should throw error when changing to an invalid name', () => {
    const project = new Project({
      name: 'Old Name',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Desc',
    });

    expect(() => project.changeName('')).toThrow('Validation failed: name should not be empty');
  });

  it('should update status', () => {
    const project = new Project({
      name: 'Name',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Desc',
    });

    project.updateStatus(ProjectStatus.EM_EXECUCAO);
    expect(project.getStatus()).toBe(ProjectStatus.EM_EXECUCAO);
  });

  it('should expose all getters correctly', () => {
    const project = new Project({
      name: 'Name',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Some description',
      urlDocument: 'https://example.com/doc',
    });

    expect(project.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(project.getProjectNumber()).toBe('#20260001');
    expect(project.getDescription()).toBe('Some description');
    expect(project.getUrlDocument()).toBe('https://example.com/doc');
    expect(project.getCreatedAt()).toBeInstanceOf(Date);
  });

  it('should change description correctly', () => {
    const project = new Project({
      name: 'Name',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Old desc',
    });

    project.changeDescription('New desc');
    expect(project.getDescription()).toBe('New desc');
  });

  it('should update urlDocument correctly', () => {
    const project = new Project({
      name: 'Name',
      id: ProjectId('550e8400-e29b-41d4-a716-446655440000'),
      projectNumber: '#20260001',
      description: 'Desc',
    });

    project.updateUrlDocument('https://example.com/new-doc');
    expect(project.getUrlDocument()).toBe('https://example.com/new-doc');
  });
});
