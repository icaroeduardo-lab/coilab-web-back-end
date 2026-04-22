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
import { Entity } from './entity.base';
import { Design } from '../value-objects/design.vo';
import { Diagram } from '../value-objects/diagram.vo';
import { SubTaskId, TaskId, DesignId, ApplicantId } from '../shared/entity-ids';

export enum Level {
  HIGH = 'Alta',
  MEDIUM = 'Média',
  LOW = 'Baixa',
}

export enum Frequency {
  DAILY = 'Diária',
  WEEKLY = 'Semanal',
  MONTHLY = 'Mensal',
  OCCASIONAL = 'Eventual',
}

export interface DiscoveryFieldEntry<T = string> {
  value: T;
  userId: ApplicantId;
  filledAt: Date;
}

export interface DiscoveryFormProps {
  complexity?: DiscoveryFieldEntry<Level>;
  projectName?: DiscoveryFieldEntry;
  summary?: DiscoveryFieldEntry;
  painPoints?: DiscoveryFieldEntry;
  frequency?: DiscoveryFieldEntry<Frequency>;
  currentProcess?: DiscoveryFieldEntry;
  inactionCost?: DiscoveryFieldEntry;
  volume?: DiscoveryFieldEntry;
  avgTime?: DiscoveryFieldEntry;
  humanDependency?: DiscoveryFieldEntry<Level>;
  rework?: DiscoveryFieldEntry;
  previousAttempts?: DiscoveryFieldEntry;
  benchmark?: DiscoveryFieldEntry;
  institutionalPriority?: DiscoveryFieldEntry<Level>;
  technicalOpinion?: DiscoveryFieldEntry;
}

export type DiscoveryFormInput = {
  complexity?: Level;
  projectName?: string;
  summary?: string;
  painPoints?: string;
  frequency?: Frequency;
  currentProcess?: string;
  inactionCost?: string;
  volume?: string;
  avgTime?: string;
  humanDependency?: Level;
  rework?: string;
  previousAttempts?: string;
  benchmark?: string;
  institutionalPriority?: Level;
  technicalOpinion?: string;
};

export enum SubTaskStatus {
  NAO_INICIADO = 'Não iniciado',
  EM_PROGRESSO = 'Em progresso',
  AGUARDANDO_CHECKOUT = 'Aguardando Checkout',
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado',
  CANCELADO = 'Cancelado',
}

export enum SubTaskType {
  DISCOVERY = 'Discovery',
  DESIGN = 'Design',
  DIAGRAM = 'Diagram',
}

export interface SubTaskProps {
  id: SubTaskId;
  taskId: TaskId;
  idUser: ApplicantId;
  status: SubTaskStatus;
  type: SubTaskType;
  expectedDelivery: Date;
  createdAt?: Date;
  startDate?: Date;
  completionDate?: Date;
  reason?: string;
}

export abstract class SubTask extends Entity {
  @IsUUID()
  @IsNotEmpty()
  protected id: SubTaskId;

  @IsUUID()
  @IsNotEmpty()
  protected taskId: TaskId;

  @IsUUID()
  @IsNotEmpty()
  protected idUser: ApplicantId;

  @IsEnum(SubTaskStatus)
  protected status: SubTaskStatus;

  @IsEnum(SubTaskType)
  protected type: SubTaskType;

  @IsDate()
  protected expectedDelivery: Date;

  @IsDate()
  protected createdAt: Date;

  @IsDate()
  @IsOptional()
  protected startDate?: Date;

  @IsDate()
  @IsOptional()
  protected completionDate?: Date;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  protected reason?: string;

  constructor(props: SubTaskProps) {
    super();
    this.id = props.id;
    this.taskId = props.taskId;
    this.idUser = props.idUser;
    this.status = props.status;
    this.type = props.type;
    this.expectedDelivery = props.expectedDelivery;
    this.createdAt = props.createdAt ?? new Date();
    this.startDate = props.startDate;
    this.completionDate = props.completionDate;
    this.reason = props.reason;
    this.validate();
  }

  // Getters
  getId(): SubTaskId {
    return this.id;
  }
  getTaskId(): TaskId {
    return this.taskId;
  }
  getIdUser(): ApplicantId {
    return this.idUser;
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
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getStartDate(): Date | undefined {
    return this.startDate;
  }
  getCompletionDate(): Date | undefined {
    return this.completionDate;
  }
  getReason(): string | undefined {
    return this.reason;
  }

  protected assertEditable(): void {
    const lockedStatuses = [
      SubTaskStatus.AGUARDANDO_CHECKOUT,
      SubTaskStatus.APROVADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];
    if (lockedStatuses.includes(this.status)) {
      throw new Error(`Subtask com status "${this.status}" não pode ser modificada`);
    }
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

  approve(): void {
    if (this.status !== SubTaskStatus.AGUARDANDO_CHECKOUT) {
      throw new Error('A subtask precisa estar Aguardando Checkout para ser aprovada');
    }
    this.status = SubTaskStatus.APROVADO;
    this.validate();
  }

  reject(reason: string): void {
    if (this.status !== SubTaskStatus.AGUARDANDO_CHECKOUT) {
      throw new Error('A subtask precisa estar Aguardando Checkout para ser reprovada');
    }
    this.status = SubTaskStatus.REPROVADO;
    this.reason = reason;
    this.validate();
  }

  cancel(reason: string): void {
    if (this.status === SubTaskStatus.APROVADO) {
      throw new Error('A subtask já foi aprovada e não pode ser cancelada');
    }
    this.status = SubTaskStatus.CANCELADO;
    this.reason = reason;
    this.validate();
  }

  updateStatus(status: SubTaskStatus): void {
    this.status = status;
    this.validate();
  }
}

export class DiscoverySubTask extends SubTask {
  private complexity?: DiscoveryFieldEntry<Level>;
  private projectName?: DiscoveryFieldEntry;
  private summary?: DiscoveryFieldEntry;
  private painPoints?: DiscoveryFieldEntry;
  private frequency?: DiscoveryFieldEntry<Frequency>;
  private currentProcess?: DiscoveryFieldEntry;
  private inactionCost?: DiscoveryFieldEntry;
  private volume?: DiscoveryFieldEntry;
  private avgTime?: DiscoveryFieldEntry;
  private humanDependency?: DiscoveryFieldEntry<Level>;
  private rework?: DiscoveryFieldEntry;
  private previousAttempts?: DiscoveryFieldEntry;
  private benchmark?: DiscoveryFieldEntry;
  private institutionalPriority?: DiscoveryFieldEntry<Level>;
  private technicalOpinion?: DiscoveryFieldEntry;

  constructor(props: Omit<SubTaskProps, 'type'> & DiscoveryFormProps) {
    super({ ...props, type: SubTaskType.DISCOVERY });
    this.complexity = props.complexity;
    this.projectName = props.projectName;
    this.summary = props.summary;
    this.painPoints = props.painPoints;
    this.frequency = props.frequency;
    this.currentProcess = props.currentProcess;
    this.inactionCost = props.inactionCost;
    this.volume = props.volume;
    this.avgTime = props.avgTime;
    this.humanDependency = props.humanDependency;
    this.rework = props.rework;
    this.previousAttempts = props.previousAttempts;
    this.benchmark = props.benchmark;
    this.institutionalPriority = props.institutionalPriority;
    this.technicalOpinion = props.technicalOpinion;
  }

  getForm(): DiscoveryFormProps {
    return {
      complexity: this.complexity,
      projectName: this.projectName,
      summary: this.summary,
      painPoints: this.painPoints,
      frequency: this.frequency,
      currentProcess: this.currentProcess,
      inactionCost: this.inactionCost,
      volume: this.volume,
      avgTime: this.avgTime,
      humanDependency: this.humanDependency,
      rework: this.rework,
      previousAttempts: this.previousAttempts,
      benchmark: this.benchmark,
      institutionalPriority: this.institutionalPriority,
      technicalOpinion: this.technicalOpinion,
    };
  }

  updateForm(data: Partial<DiscoveryFormInput>, userId: ApplicantId): void {
    this.assertEditable();
    const filledAt = new Date();
    (Object.entries(data) as [keyof DiscoveryFormInput, unknown][]).forEach(([key, value]) => {
      if (value !== undefined) {
        (this as unknown as Record<string, unknown>)[key] = { value, userId, filledAt };
      }
    });
  }

  override complete(): void {
    this.assertFormComplete();
    super.complete();
  }

  private assertFormComplete(): void {
    const fields: (keyof DiscoveryFormProps)[] = [
      'complexity',
      'projectName',
      'summary',
      'painPoints',
      'frequency',
      'currentProcess',
      'inactionCost',
      'volume',
      'avgTime',
      'humanDependency',
      'rework',
      'previousAttempts',
      'benchmark',
      'institutionalPriority',
      'technicalOpinion',
    ];
    const missing = fields.filter((f) => !this[f as keyof this]);
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios não preenchidos: ${missing.join(', ')}`);
    }
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
    this.assertEditable();
    this.designs.push(design);
    this.validate();
  }

  removeDesign(id: DesignId): void {
    this.assertEditable();
    const index = this.designs.findIndex((d) => d.getId() === id);
    if (index === -1) {
      throw new Error(`Design com id ${id} não encontrado`);
    }
    this.designs.splice(index, 1);
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
    this.assertEditable();
    this.diagrams.push(diagram);
    this.validate();
  }

  removeDiagram(title: string): void {
    this.assertEditable();
    const index = this.diagrams.findIndex((d) => d.getTitle() === title);
    if (index === -1) {
      throw new Error(`Diagram com título "${title}" não encontrado`);
    }
    this.diagrams.splice(index, 1);
    this.validate();
  }
}
