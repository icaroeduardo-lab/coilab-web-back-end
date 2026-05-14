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

export interface CanvasImpact {
  description?: string;
  labels?: string[];
}

export interface CanvasPart {
  name?: string;
  role?: string;
}

export interface CanvasResource {
  type?: string;
  description?: string[];
}

export interface CanvasRiskAndMitigation {
  risk?: string;
  mitigation?: string;
}

export interface CanvasTeamMember {
  avatar?: string;
  name?: string;
  role?: string;
  isLead?: boolean;
}

export interface Canvas {
  problem?: string;
  target?: string[];
  objective?: string[];
  impact?: CanvasImpact;
  parts?: CanvasPart[];
  resources?: CanvasResource[];
  risksAndMitigation?: CanvasRiskAndMitigation[];
  indicators?: string[];
  team?: CanvasTeamMember[];
  notes?: string;
}

export interface ProjectProps {
  id: ProjectId;
  name: string;
  projectNumber: string;
  description: string;
  canvas?: Canvas;
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

  @IsOptional()
  private canvas?: Canvas;

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
    this.canvas = props.canvas;
    this.status = props.status ?? ProjectStatus.BACKLOG;
    this.createdAt = props.createdAt ?? new Date();

    this.validate();
  }

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
  getCanvas(): Canvas | undefined {
    return this.canvas;
  }
  getStatus(): ProjectStatus {
    return this.status;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }

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

  updateCanvas(canvas: Canvas): void {
    this.canvas = canvas;
    this.validate();
  }
}
