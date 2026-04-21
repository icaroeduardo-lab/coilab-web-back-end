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

    const projectProps = {
      name: 'Project Alpha',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Test description',
      urlDocument: 'https://example.com/doc',
      status: ProjectStatus.BACKLOG,
      createdAt: new Date(),
      applicant,
      flows: [flow],
    };

    const project = new Project(projectProps);

    expect(project.getId()).toBe(projectProps.id);
    expect(project.getFlows()).toHaveLength(1);
    expect(project.getFlows()[0].getName()).toBe('Initial Flow');
    expect(project.getTasks()).toHaveLength(0);
    expect(project.getApplicant().getName()).toBe('John Doe');
  });

  it('should add flow to project', () => {
    const project = new Project({
      name: 'Project Alpha',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
      applicant,
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
      applicant,
    });

    const task = new Task({
      id: '550e8400-e29b-41d4-a716-446655440001',
      projectId: project.getId(),
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.BAIXA,
      status: TaskStatus.BACKLOG,
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
      applicant,
    });

    const task = new Task({
      id: '550e8400-e29b-41d4-a716-446655440001',
      projectId: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Task 01',
      description: 'Desc',
      taskNumber: 'T-001',
      priority: TaskPriority.BAIXA,
      status: TaskStatus.BACKLOG,
    });

    expect(() => project.addTask(task)).toThrow('Task does not belong to this project');
  });

  it('should change name correctly', () => {
    const project = new Project({
      name: 'Old Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
      applicant,
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
      applicant,
    });

    expect(() => project.changeName('')).toThrow('Validation failed: name should not be empty');
  });

  it('should update status', () => {
    const project = new Project({
      name: 'Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
      applicant,
    });

    project.updateStatus(ProjectStatus.EM_EXECUCAO);
    expect(project.getStatus()).toBe(ProjectStatus.EM_EXECUCAO);
  });

  it('should change applicant', () => {
    const project = new Project({
      name: 'Name',
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectNumber: 'P-001',
      description: 'Desc',
      applicant,
    });

    const newApplicant = new Applicant({
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Jane Smith',
    });

    project.changeApplicant(newApplicant);
    expect(project.getApplicant().getName()).toBe('Jane Smith');
  });
});