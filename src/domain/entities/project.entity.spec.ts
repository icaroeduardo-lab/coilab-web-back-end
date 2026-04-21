import { Project, ProjectStatus } from './project.entity';
import { Task, TaskPriority, TaskStatus } from './task.entity';
import { Applicant } from '../value-objects/applicant.vo';
import { Flow } from '../value-objects/flow.vo';

describe('Project Entity', () => {
  const applicant = new Applicant({
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'John Doe',
  });

  it('should create a new project with all properties', () => {
    const flow = new Flow({
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Initial Flow',
    });

    const project = new Project({
      name: 'Project Alpha',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Test description',
      urlDocument: 'https://example.com/doc',
      status: ProjectStatus.BACKLOG,
      createdAt: new Date(),
      flows: [flow],
    });

    expect(project.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(project.getFlows()).toHaveLength(1);
    expect(project.getFlows()[0].getName()).toBe('Initial Flow');
    expect(project.getTasks()).toHaveLength(0);
  });

  it('should add flow to project', () => {
    const project = new Project({
      name: 'Project Alpha',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    const flow = new Flow({
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'New Flow',
    });

    project.addFlow(flow);
    expect(project.getFlows()).toHaveLength(1);
  });

  it('should add tasks to project', () => {
    const project = new Project({
      name: 'Project Alpha',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    const task = new Task({
      id: '550e8400-e29b-41d4-a716-446655440001',
      projectId: project.getId(),
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.BAIXA,
      status: TaskStatus.BACKLOG,
      applicant,
    });

    project.addTask(task);

    expect(project.getTasks()).toHaveLength(1);
    expect(project.getTasks()[0].getId()).toBe(task.getId());
  });

  it('should throw error when adding task from another project', () => {
    const project = new Project({
      name: 'Project Alpha',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    const task = new Task({
      id: '550e8400-e29b-41d4-a716-446655440001',
      projectId: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.BAIXA,
      status: TaskStatus.BACKLOG,
      applicant,
    });

    expect(() => project.addTask(task)).toThrow('Task does not belong to this project');
  });

  it('should change name correctly', () => {
    const project = new Project({
      name: 'Old Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    project.changeName('New Name');
    expect(project.getName()).toBe('New Name');
  });

  it('should throw error when changing to an invalid name', () => {
    const project = new Project({
      name: 'Old Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    expect(() => project.changeName('')).toThrow('Validation failed: name should not be empty');
  });

  it('should update status', () => {
    const project = new Project({
      name: 'Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    project.updateStatus(ProjectStatus.EM_EXECUCAO);
    expect(project.getStatus()).toBe(ProjectStatus.EM_EXECUCAO);
  });

  it('should expose all getters correctly', () => {
    const project = new Project({
      name: 'Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Some description',
      urlDocument: 'https://example.com/doc',
    });

    expect(project.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(project.getProjectNumber()).toBe('P-001');
    expect(project.getDescription()).toBe('Some description');
    expect(project.getUrlDocument()).toBe('https://example.com/doc');
    expect(project.getCreatedAt()).toBeInstanceOf(Date);
  });

  it('should change description correctly', () => {
    const project = new Project({
      name: 'Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Old desc',
    });

    project.changeDescription('New desc');
    expect(project.getDescription()).toBe('New desc');
  });

  it('should update urlDocument correctly', () => {
    const project = new Project({
      name: 'Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
    });

    project.updateUrlDocument('https://example.com/new-doc');
    expect(project.getUrlDocument()).toBe('https://example.com/new-doc');
  });
});
