import 'reflect-metadata';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDate, Matches } from 'class-validator';
import { Entity } from './entity.base';
import { ProjectId } from '../shared/entity-ids';
import { SEQUENTIAL_NUMBER_REGEX } from '../shared/sequential-number';

export enum ProjectStatus {
  BACKLOG = 'backlog',
  EM_EXECUCAO = 'em execução',
  CONCLUIDO = 'concluído',
  CANCELADO = 'cancelado',
}

export interface ProjectProps {
  id: ProjectId;
  name: string;
  projectNumber: string;
  description: string;
  urlDocument?: string;
  status?: ProjectStatus;
  createdAt?: Date;
}

export class Project extends Entity {
  @IsString()
  @IsNotEmpty()
  private id: ProjectId;

  @IsString()
  @IsNotEmpty()
  private name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(SEQUENTIAL_NUMBER_REGEX)
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

  constructor(props: ProjectProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.projectNumber = props.projectNumber;
    this.description = props.description;
    this.urlDocument = props.urlDocument;
    this.status = props.status ?? ProjectStatus.BACKLOG;
    this.createdAt = props.createdAt ?? new Date();

    this.validate();
  }

  // Getters
  getId(): ProjectId {
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
}
