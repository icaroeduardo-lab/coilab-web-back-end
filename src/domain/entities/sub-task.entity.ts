import 'reflect-metadata';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { Entity } from './entity.base';
import { SubTaskId, TaskId, TaskToolId, UserId } from '../shared/entity-ids';
import { SEQUENTIAL_NUMBER_REGEX } from '../shared/sequential-number';

export enum SubTaskStatus {
  NAO_INICIADO = 'Não iniciado',
  EM_PROGRESSO = 'Em progresso',
  AGUARDANDO_CHECKOUT = 'Aguardando Checkout',
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado',
  CANCELADO = 'Cancelado',
}

export interface SubTaskProps {
  id: SubTaskId;
  taskId: TaskId;
  idUser: UserId;
  status: SubTaskStatus;
  typeId: TaskToolId;
  taskNumber: string;
  expectedDelivery: Date;
  createdAt?: Date;
  startDate?: Date;
  completionDate?: Date;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export class SubTask extends Entity {
  @IsUUID()
  @IsNotEmpty()
  protected id: SubTaskId;

  @IsUUID()
  @IsNotEmpty()
  protected taskId: TaskId;

  @IsUUID()
  @IsNotEmpty()
  protected idUser: UserId;

  @IsEnum(SubTaskStatus)
  protected status: SubTaskStatus;

  @IsInt()
  @Min(1)
  protected typeId: TaskToolId;

  @Matches(SEQUENTIAL_NUMBER_REGEX)
  @IsNotEmpty()
  protected taskNumber: string;

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

  protected metadata: Record<string, unknown>;

  constructor(props: SubTaskProps) {
    super();
    this.id = props.id;
    this.taskId = props.taskId;
    this.idUser = props.idUser;
    this.status = props.status;
    this.typeId = props.typeId;
    this.taskNumber = props.taskNumber;
    this.expectedDelivery = props.expectedDelivery;
    this.createdAt = props.createdAt ?? new Date();
    this.startDate = props.startDate;
    this.completionDate = props.completionDate;
    this.reason = props.reason;
    this.metadata = props.metadata ?? {};
    this.validate();
  }

  getId(): SubTaskId {
    return this.id;
  }
  getTaskId(): TaskId {
    return this.taskId;
  }
  getIdUser(): UserId {
    return this.idUser;
  }
  getStatus(): SubTaskStatus {
    return this.status;
  }
  getTypeId(): TaskToolId {
    return this.typeId;
  }
  getTaskNumber(): string {
    return this.taskNumber;
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
  getMetadata(): Record<string, unknown> {
    return this.metadata;
  }

  updateMetadata(data: Record<string, unknown>): void {
    this.assertEditable();
    this.metadata = { ...this.metadata, ...data };
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
