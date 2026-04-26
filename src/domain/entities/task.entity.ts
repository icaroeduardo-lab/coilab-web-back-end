import 'reflect-metadata';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsEnum,
  IsArray,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Entity } from './entity.base';
import {
  DiscoverySubTask,
  DesignSubTask,
  DiagramSubTask,
  SubTask,
  SubTaskStatus,
  SubTaskType,
} from './sub-task.entity';
import { TaskStatus } from './task-status.enum';
import { ProjectId, TaskId, ApplicantId, UserId, FlowId } from '../shared/entity-ids';
import { SEQUENTIAL_NUMBER_REGEX } from '../shared/sequential-number';

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
  @IsUUID()
  @IsNotEmpty()
  private id: TaskId;

  @IsUUID()
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

  @IsUUID()
  @IsNotEmpty()
  private applicantId: ApplicantId;

  @IsUUID()
  @IsNotEmpty()
  private creatorId: UserId;

  @ValidateNested({ each: true })
  private subTasks: SubTask[];

  @IsArray()
  @IsUUID('4', { each: true })
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

  private groupSubTasksByType(): Record<SubTaskType, SubTask[]> {
    return this.subTasks.reduce(
      (acc, sub) => {
        const type = sub.getType();
        if (!acc[type]) acc[type] = [];
        acc[type].push(sub);
        return acc;
      },
      {} as Record<SubTaskType, SubTask[]>,
    );
  }

  private checkoutConditionsMet(): boolean {
    if (this.subTasks.length === 0) return false;
    const groups = this.groupSubTasksByType();
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

    // EM_EXECUCAO/BACKLOG → CHECKOUT using grouped rules:
    // every type must be all-terminal; if any REPROVADO, needs replacement AGUARDANDO_CHECKOUT
    if (
      (this.status === TaskStatus.EM_EXECUCAO || this.status === TaskStatus.BACKLOG) &&
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

  getDiscovery(): DiscoverySubTask[] {
    return this.subTasks.filter((s) => s instanceof DiscoverySubTask) as DiscoverySubTask[];
  }
  getDesign(): DesignSubTask[] {
    return this.subTasks.filter((s) => s instanceof DesignSubTask) as DesignSubTask[];
  }
  getDiagram(): DiagramSubTask[] {
    return this.subTasks.filter((s) => s instanceof DiagramSubTask) as DiagramSubTask[];
  }

  changeName(name: string): void {
    this.name = name;
    this.validate();
  }

  changeDescription(description: string): void {
    this.description = description;
    this.validate();
  }

  changePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.validate();
  }

  changeStatus(status: TaskStatus): void {
    this.status = status;
    this.applyStatusRules();
    this.validate();
  }

  changeProjectId(projectId: ProjectId): void {
    this.projectId = projectId;
    this.validate();
  }

  changeApplicantId(applicantId: ApplicantId): void {
    this.applicantId = applicantId;
    this.validate();
  }

  addFlowId(flowId: FlowId): void {
    if (this.flowIds.includes(flowId)) {
      throw new Error(`Flow já adicionado: ${flowId}`);
    }
    this.flowIds.push(flowId);
    this.validate();
  }

  removeFlowId(flowId: string): void {
    const exists = this.flowIds.includes(flowId as FlowId);
    if (!exists) {
      throw new Error(`Flow não encontrado: ${flowId}`);
    }
    this.flowIds = this.flowIds.filter((f) => f !== flowId);
    this.validate();
  }

  assertCanBeDeleted(): void {
    const terminalStatuses = [
      SubTaskStatus.NAO_INICIADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];
    const allTerminal = this.subTasks.every((s) => terminalStatuses.includes(s.getStatus()));
    if (allTerminal) return;
    throw new Error('Task não pode ser removida pois possui subtasks ativas');
  }

  removeSubTask(subTaskId: string): void {
    const removableStatuses = [
      SubTaskStatus.NAO_INICIADO,
      SubTaskStatus.REPROVADO,
      SubTaskStatus.CANCELADO,
    ];
    const subTask = this.subTasks.find((s) => s.getId() === subTaskId);
    if (!subTask) {
      throw new Error(`SubTask não encontrada: ${subTaskId}`);
    }
    if (!removableStatuses.includes(subTask.getStatus())) {
      throw new Error(`SubTask com status "${subTask.getStatus()}" não pode ser removida`);
    }
    this.subTasks = this.subTasks.filter((s) => s.getId() !== subTaskId);
    this.validate();
  }

  addSubTask(subTask: SubTask): void {
    const lastOfSameType = this.subTasks.filter((s) => s.getType() === subTask.getType()).pop();

    if (lastOfSameType && lastOfSameType.getStatus() !== SubTaskStatus.REPROVADO) {
      throw new Error(
        `Não é possível adicionar uma nova subtask do tipo ${subTask.getType()} enquanto a anterior não estiver Reprovada`,
      );
    }

    this.subTasks.push(subTask);
    this.applyStatusRules();
    this.validate();
  }
}
