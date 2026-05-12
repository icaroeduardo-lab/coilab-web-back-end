import 'reflect-metadata';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsDate,
  IsEnum,
  IsArray,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Entity } from './entity.base';
import { SubTask, SubTaskStatus } from './sub-task.entity';
import { TaskStatus } from './task-status.enum';
import { ProjectId, TaskId, ApplicantId, UserId, FlowId } from '../shared/entity-ids';
import { SEQUENTIAL_NUMBER_REGEX } from '../shared/sequential-number';
import { DomainException } from '../shared/domain.exception';

export { TaskStatus };

export enum TaskPriority {
  BAIXA = 'baixa',
  MEDIA = 'média',
  ALTA = 'alta',
}

export interface TaskProps {
  id: TaskId;
  projectId: ProjectId;
  name: string;
  description: string;
  taskNumber: string;
  priority: TaskPriority;
  status: TaskStatus;
  applicantId: ApplicantId;
  creatorId: UserId;
  subTasks?: SubTask[];
  flowIds?: FlowId[];
  createdAt?: Date;
}

export class Task extends Entity {
  @IsString()
  @IsNotEmpty()
  private id: TaskId;

  @IsString()
  @IsNotEmpty()
  private projectId: ProjectId;

  @IsString()
  @IsNotEmpty()
  private name: string;

  @IsString()
  @IsNotEmpty()
  private description: string;

  @Matches(SEQUENTIAL_NUMBER_REGEX)
  @IsNotEmpty()
  private taskNumber: string;

  @IsEnum(TaskPriority)
  private priority: TaskPriority;

  @IsEnum(TaskStatus)
  private status: TaskStatus;

  @IsInt()
  @Min(0)
  private applicantId: ApplicantId;

  @IsString()
  @IsNotEmpty()
  private creatorId: UserId;

  @ValidateNested({ each: true })
  private subTasks: SubTask[];

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  private flowIds: FlowId[];

  @IsDate()
  private createdAt: Date;

  constructor(props: TaskProps) {
    super();
    this.id = props.id;
    this.projectId = props.projectId;
    this.name = props.name;
    this.description = props.description;
    this.taskNumber = props.taskNumber;
    this.priority = props.priority;
    this.status = props.status;
    this.applicantId = props.applicantId;
    this.creatorId = props.creatorId;
    this.subTasks = props.subTasks ?? [];
    this.flowIds = props.flowIds ?? [];
    this.createdAt = props.createdAt ?? new Date();

    this.applyStatusRules();
    this.validate();
  }

  private groupSubTasksByTypeId(): Record<number, SubTask[]> {
    return this.subTasks.reduce(
      (acc, sub) => {
        const typeId = sub.getTypeId();
        if (!acc[typeId]) acc[typeId] = [];
        acc[typeId].push(sub);
        return acc;
      },
      {} as Record<number, SubTask[]>,
    );
  }

  private concluidoConditionsMet(): boolean {
    if (this.subTasks.length === 0) return true;

    const blocking = [
      SubTaskStatus.EM_PROGRESSO,
      SubTaskStatus.NAO_INICIADO,
      SubTaskStatus.AGUARDANDO_CHECKOUT,
    ];
    if (this.subTasks.some((s) => blocking.includes(s.getStatus()))) return false;

    const groups = this.groupSubTasksByTypeId();
    return Object.values(groups).every((group) => {
      const nonCancelled = group.filter((s) => s.getStatus() !== SubTaskStatus.CANCELADO);
      if (nonCancelled.length === 0) return true;
      return nonCancelled.some((s) => s.getStatus() === SubTaskStatus.APROVADO);
    });
  }

  private desenvolvimentoConditionsMet(): boolean {
    const hasDevelopmentSubTask = this.subTasks.some(
      (s) => s.getTypeId() === 4 && s.getStatus() !== SubTaskStatus.CANCELADO,
    );
    if (!hasDevelopmentSubTask) return false;

    const blocking = [
      SubTaskStatus.EM_PROGRESSO,
      SubTaskStatus.NAO_INICIADO,
      SubTaskStatus.AGUARDANDO_CHECKOUT,
    ];
    if (this.subTasks.some((s) => blocking.includes(s.getStatus()))) return false;

    const groups = this.groupSubTasksByTypeId();
    return Object.values(groups).every((group) => {
      const nonCancelled = group.filter((s) => s.getStatus() !== SubTaskStatus.CANCELADO);
      if (nonCancelled.length === 0) return true;
      return nonCancelled.some((s) => s.getStatus() === SubTaskStatus.APROVADO);
    });
  }

  private checkoutConditionsMet(): boolean {
    if (this.subTasks.length === 0) return true;
    const groups = this.groupSubTasksByTypeId();
    return Object.values(groups).every((group) => {
      const allTerminal = group.every(
        (s) =>
          s.getStatus() === SubTaskStatus.AGUARDANDO_CHECKOUT ||
          s.getStatus() === SubTaskStatus.APROVADO ||
          s.getStatus() === SubTaskStatus.REPROVADO ||
          s.getStatus() === SubTaskStatus.CANCELADO,
      );
      const hasReprovado = group.some((s) => s.getStatus() === SubTaskStatus.REPROVADO);
      const hasAwaiting = group.some((s) => s.getStatus() === SubTaskStatus.AGUARDANDO_CHECKOUT);
      // if any REPROVADO in group, must have a replacement AGUARDANDO_CHECKOUT
      return allTerminal && (!hasReprovado || hasAwaiting);
    });
  }

  private applyStatusRules(): void {
    // All NAO_INICIADO → BACKLOG
    if (this.subTasks.length > 0) {
      const allNotStarted = this.subTasks.every(
        (s) => s.getStatus() === SubTaskStatus.NAO_INICIADO,
      );
      if (allNotStarted) {
        this.status = TaskStatus.BACKLOG;
        return;
      }
    }

    // BACKLOG → EM_EXECUCAO when any subtask starts
    if (this.status === TaskStatus.BACKLOG) {
      const hasAnyInProgress = this.subTasks.some(
        (s) => s.getStatus() === SubTaskStatus.EM_PROGRESSO,
      );
      if (hasAnyInProgress) {
        this.status = TaskStatus.EM_EXECUCAO;
      }
    }

    // EM_EXECUCAO/BACKLOG → CHECKOUT: subtasks must exist and all meet grouped conditions
    if (
      (this.status === TaskStatus.EM_EXECUCAO || this.status === TaskStatus.BACKLOG) &&
      this.subTasks.length > 0 &&
      this.checkoutConditionsMet()
    ) {
      this.status = TaskStatus.CHECKOUT;
    }

    // CHECKOUT → EM_EXECUCAO when conditions no longer met
    if (this.status === TaskStatus.CHECKOUT && !this.checkoutConditionsMet()) {
      this.status = TaskStatus.EM_EXECUCAO;
    }
  }

  getId(): TaskId {
    return this.id;
  }
  getProjectId(): ProjectId {
    return this.projectId;
  }
  getName(): string {
    return this.name;
  }
  getDescription(): string {
    return this.description;
  }
  getTaskNumber(): string {
    return this.taskNumber;
  }
  getPriority(): TaskPriority {
    return this.priority;
  }
  getStatus(): TaskStatus {
    return this.status;
  }
  getApplicantId(): ApplicantId {
    return this.applicantId;
  }
  getCreatorId(): UserId {
    return this.creatorId;
  }
  getSubTasks(): SubTask[] {
    return this.subTasks;
  }
  getFlowIds(): FlowId[] {
    return this.flowIds;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }

  assertEditable(): void {
    if (this.status === TaskStatus.CONCLUIDO) {
      throw new DomainException('Task concluída não pode ser modificada');
    }
  }

  changeName(name: string): void {
    this.assertEditable();
    this.name = name;
    this.validate();
  }

  changeDescription(description: string): void {
    this.assertEditable();
    this.description = description;
    this.validate();
  }

  changePriority(priority: TaskPriority): void {
    this.assertEditable();
    this.priority = priority;
    this.validate();
  }

  changeStatus(status: TaskStatus): void {
    this.assertEditable();
    if (status === TaskStatus.DESENVOLVIMENTO && !this.desenvolvimentoConditionsMet()) {
      throw new DomainException(
        'Para ir para Desenvolvimento é necessário ter ao menos uma subtask de Desenvolvimento ativa. ' +
          'Todas as subtasks devem estar Aprovadas. ' +
          'Subtasks Reprovadas precisam ter uma substituta Aprovada do mesmo tipo. ' +
          'Nenhuma subtask pode estar Em Progresso, Não Iniciada ou Aguardando Checkout.',
      );
    }
    if (status === TaskStatus.CONCLUIDO && !this.concluidoConditionsMet()) {
      throw new DomainException('Tarfeas não podem ser concluídas com sub tarefas abertas.');
    }
    this.status = status;
    this.applyStatusRules();
    this.validate();
  }

  changeProjectId(projectId: ProjectId): void {
    this.assertEditable();
    this.projectId = projectId;
    this.validate();
  }

  changeApplicantId(applicantId: ApplicantId): void {
    this.assertEditable();
    this.applicantId = applicantId;
    this.validate();
  }

  addFlowId(flowId: FlowId): void {
    this.assertEditable();
    if (this.flowIds.includes(flowId)) {
      throw new DomainException(`Flow já adicionado: ${flowId}`);
    }
    this.flowIds.push(flowId);
    this.validate();
  }

  removeFlowId(flowId: FlowId): void {
    this.assertEditable();
    const exists = this.flowIds.includes(flowId);
    if (!exists) {
      throw new DomainException(`Flow não encontrado: ${flowId}`);
    }
    this.flowIds = this.flowIds.filter((f) => f !== flowId);
    this.validate();
  }

  private developmentSubTaskCanBeRemoved(subTask: SubTask): boolean {
    const issues = (subTask.getMetadata().issues ?? []) as { status: boolean }[];
    return !issues.some((i) => i.status === true);
  }

  assertCanBeDeleted(): void {
    const terminalStatuses = [
      SubTaskStatus.NAO_INICIADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];
    const allRemovable = this.subTasks.every((s) => {
      if (s.getTypeId() === 4) return this.developmentSubTaskCanBeRemoved(s);
      return terminalStatuses.includes(s.getStatus());
    });
    if (allRemovable) return;
    throw new DomainException('Task não pode ser removida pois possui subtasks ativas');
  }

  removeSubTask(subTaskId: string): void {
    this.assertEditable();
    const removableStatuses = [
      SubTaskStatus.NAO_INICIADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];
    const subTask = this.subTasks.find((s) => s.getId() === subTaskId);
    if (!subTask) {
      throw new DomainException(`SubTask não encontrada: ${subTaskId}`);
    }
    if (subTask.getTypeId() === 4) {
      if (!this.developmentSubTaskCanBeRemoved(subTask)) {
        throw new DomainException(
          'Subtask de Desenvolvimento não pode ser removida pois possui issues concluídas',
        );
      }
    } else if (!removableStatuses.includes(subTask.getStatus())) {
      throw new DomainException(
        `SubTask com status "${subTask.getStatus()}" não pode ser removida`,
      );
    }
    this.subTasks = this.subTasks.filter((s) => s.getId() !== subTaskId);
    this.validate();
  }

  addSubTask(subTask: SubTask): void {
    this.assertEditable();
    const lastOfSameType = this.subTasks.filter((s) => s.getTypeId() === subTask.getTypeId()).pop();

    if (lastOfSameType && lastOfSameType.getStatus() !== SubTaskStatus.REPROVADO) {
      throw new DomainException(
        `Não é possível adicionar uma nova subtask do tipo ${subTask.getTypeId()} enquanto a anterior não estiver Reprovada`,
      );
    }

    this.subTasks.push(subTask);
    this.applyStatusRules();
    this.validate();
  }
}
