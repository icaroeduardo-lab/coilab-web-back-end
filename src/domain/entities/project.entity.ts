import 'reflect-metadata';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { ClassValidatorStrategy } from '../validators/class-validator-strategy';
import { Task } from './task.entity';
import { Applicant } from '../value-objects/applicant.vo';
import { Flow } from '../value-objects/flow.vo';

export enum ProjectStatus {
  BACKLOG = 'backlog',
  EM_EXECUCAO = 'em execução',
  CONCLUIDO = 'concluído',
  CANCELADO = 'cancelado',
}

export interface ProjectProps {
  id: string;
  name: string;
  projectNumber: string;
  description: string;
  urlDocument?: string;
  status?: ProjectStatus;
  createdAt?: Date;
  tasks?: Task[];
  applicant: Applicant;
  flows?: Flow[];
}

export class Project {
  @IsUUID()
  @IsNotEmpty()
  private id: string;

  @IsString()
  @IsNotEmpty()
  private name: string;

  @IsString()
  @IsNotEmpty()
  private projectNumber: string;

  @IsString()
  @IsNotEmpty()
  private description: string;

  @IsString()
  @IsOptional()
  private urlDocument?: string;

  @IsEnum(ProjectStatus)
  private status: ProjectStatus;

  @IsDate()
  private createdAt: Date;

  @ValidateNested()
  private applicant: Applicant;

  @ValidateNested({ each: true })
  private flows: Flow[];

  private tasks: Task[];

  constructor(props: ProjectProps) {
    this.id = props.id;
    this.name = props.name;
    this.projectNumber = props.projectNumber;
    this.description = props.description;
    this.urlDocument = props.urlDocument;
    this.status = props.status ?? ProjectStatus.BACKLOG;
    this.createdAt = props.createdAt ?? new Date();
    this.tasks = props.tasks ?? [];
    this.applicant = props.applicant;
    this.flows = props.flows ?? [];

    this.validate();
  }

  private validate() {
    const validator = new ClassValidatorStrategy<Project>();
    validator.validate(this);
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getProjectNumber(): string {
    return this.projectNumber;
  }
  getDescription(): string {
    return this.description;
  }
  getUrlDocument(): string | undefined {
    return this.urlDocument;
  }
  getStatus(): ProjectStatus {
    return this.status;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getTasks(): Task[] {
    return this.tasks;
  }
  getApplicant(): Applicant {
    return this.applicant;
  }
  getFlows(): Flow[] {
    return this.flows;
  }

  // Business Rules
  changeName(name: string): void {
    this.name = name;
    this.validate();
  }

  changeDescription(description: string): void {
    this.description = description;
    this.validate();
  }

  updateStatus(status: ProjectStatus): void {
    this.status = status;
    this.validate();
  }

  updateUrlDocument(url: string): void {
    this.urlDocument = url;
    this.validate();
  }

  addTask(task: Task): void {
    if (task.getProjectId() !== this.id) {
      throw new Error('Task does not belong to this project');
    }
    this.tasks.push(task);
  }

  changeApplicant(applicant: Applicant): void {
    this.applicant = applicant;
    this.validate();
  }

  addFlow(flow: Flow): void {
    this.flows.push(flow);
    this.validate();
  }
}
