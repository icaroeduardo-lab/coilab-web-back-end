import 'reflect-metadata';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsDate, ValidateNested } from 'class-validator';
import { Entity } from './entity.base';
import { Discovery } from '../value-objects/discovery.vo';
import { Design } from '../value-objects/design.vo';
import { Diagram } from '../value-objects/diagram.vo';
import { TaskStatus } from './task-status.enum';

export enum SubTaskStatus {
  NAO_INICIADO = 'Não iniciado',
  EM_PROGRESSO = 'Em progresso',
  AGUARDANDO_CHECKOUT = 'Aguardando Checkout',
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado',
}

export enum SubTaskType {
  DISCOVERY = 'Discovery',
  DESIGN = 'Design',
  DIAGRAM = 'Diagram',
}

export interface SubTaskProps {
  id: string;
  taskId: string;
  status: SubTaskStatus;
  type: SubTaskType;
  expectedDelivery: Date;
  startDate?: Date;
  completionDate?: Date;
}

export abstract class SubTask extends Entity {
  @IsUUID()
  @IsNotEmpty()
  protected id: string;

  @IsUUID()
  @IsNotEmpty()
  protected taskId: string;

  @IsEnum(SubTaskStatus)
  protected status: SubTaskStatus;

  @IsEnum(SubTaskType)
  protected type: SubTaskType;

  @IsDate()
  protected expectedDelivery: Date;

  @IsDate()
  @IsOptional()
  protected startDate?: Date;

  @IsDate()
  @IsOptional()
  protected completionDate?: Date;

  constructor(props: SubTaskProps) {
    super();
    this.id = props.id;
    this.taskId = props.taskId;
    this.status = props.status;
    this.type = props.type;
    this.expectedDelivery = props.expectedDelivery;
    this.startDate = props.startDate;
    this.completionDate = props.completionDate;
    this.validate();
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getTaskId(): string {
    return this.taskId;
  }
  getStatus(): SubTaskStatus {
    return this.status;
  }
  getType(): SubTaskType {
    return this.type;
  }
  getExpectedDelivery(): Date {
    return this.expectedDelivery;
  }
  getStartDate(): Date | undefined {
    return this.startDate;
  }
  getCompletionDate(): Date | undefined {
    return this.completionDate;
  }

  // Common Business Rules
  start(): void {
    this.status = SubTaskStatus.EM_PROGRESSO;
    this.startDate = new Date();
    this.validate();
  }

  complete(): void {
    this.status = SubTaskStatus.AGUARDANDO_CHECKOUT;
    this.completionDate = new Date();
    this.validate();
  }

  approve(taskStatus: TaskStatus): void {
    if (this.status !== SubTaskStatus.AGUARDANDO_CHECKOUT) {
      throw new Error('A subtask precisa estar Aguardando Checkout para ser aprovada');
    }
    if (taskStatus !== TaskStatus.CHECKOUT) {
      throw new Error('A task precisa estar em Checkout para aprovar uma subtask');
    }
    this.status = SubTaskStatus.APROVADO;
    this.validate();
  }

  reject(taskStatus: TaskStatus): void {
    if (this.status !== SubTaskStatus.AGUARDANDO_CHECKOUT) {
      throw new Error('A subtask precisa estar Aguardando Checkout para ser reprovada');
    }
    if (taskStatus !== TaskStatus.CHECKOUT) {
      throw new Error('A task precisa estar em Checkout para reprovar uma subtask');
    }
    this.status = SubTaskStatus.REPROVADO;
    this.validate();
  }

  updateStatus(status: SubTaskStatus): void {
    this.status = status;
    this.validate();
  }
}

export class DiscoverySubTask extends SubTask {
  @ValidateNested({ each: true })
  private discoveries: Discovery[];

  constructor(props: Omit<SubTaskProps, 'type'> & { discoveries?: Discovery[] }) {
    super({ ...props, type: SubTaskType.DISCOVERY });
    this.discoveries = props.discoveries ?? [];
  }

  getDiscoveries(): Discovery[] {
    return this.discoveries;
  }
  addDiscovery(discovery: Discovery): void {
    this.discoveries.push(discovery);
    this.validate();
  }
}

export class DesignSubTask extends SubTask {
  @ValidateNested({ each: true })
  private designs: Design[];

  constructor(props: Omit<SubTaskProps, 'type'> & { designs?: Design[] }) {
    super({ ...props, type: SubTaskType.DESIGN });
    this.designs = props.designs ?? [];
  }

  getDesigns(): Design[] {
    return this.designs;
  }
  addDesign(design: Design): void {
    this.designs.push(design);
    this.validate();
  }
}

export class DiagramSubTask extends SubTask {
  @ValidateNested({ each: true })
  private diagrams: Diagram[];

  constructor(props: Omit<SubTaskProps, 'type'> & { diagrams?: Diagram[] }) {
    super({ ...props, type: SubTaskType.DIAGRAM });
    this.diagrams = props.diagrams ?? [];
  }

  getDiagrams(): Diagram[] {
    return this.diagrams;
  }
  addDiagram(diagram: Diagram): void {
    this.diagrams.push(diagram);
    this.validate();
  }
}
