import 'reflect-metadata';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsEnum,
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
import { Flow } from '../value-objects/flow.vo';
import { TaskStatus } from './task-status.enum';
import { ProjectId, TaskId, ApplicantId, UserId } from '../shared/entity-ids';
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
  flows?: Flow[];
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

  @ValidateNested({ each: true })
  private flows: Flow[];

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
    this.flows = props.flows ?? [];
    this.createdAt = props.createdAt ?? new Date();

    this.applyStatusRules();
    this.validate();
  }

  private applyStatusRules(): void {
    if (this.status === TaskStatus.BACKLOG) {
      const hasAnyInProgress = this.subTasks.some(
        (s) => s.getStatus() === SubTaskStatus.EM_PROGRESSO,
      );
      if (hasAnyInProgress) {
        this.status = TaskStatus.EM_EXECUCAO;
      }
    }

    if (this.status === TaskStatus.CHECKOUT) {
      if (this.subTasks.length === 0) return;

      const groupedByType = this.subTasks.reduce(
        (acc, sub) => {
          const type = sub.getType();
          if (!acc[type]) acc[type] = [];
          acc[type].push(sub);
          return acc;
        },
        {} as Record<SubTaskType, SubTask[]>,
      );

      const canCheckout = Object.values(groupedByType).every((group) => {
        const allTerminal = group.every(
          (s) =>
            s.getStatus() === SubTaskStatus.AGUARDANDO_CHECKOUT ||
            s.getStatus() === SubTaskStatus.APROVADO ||
            s.getStatus() === SubTaskStatus.REPROVADO,
        );
        const hasReprovado = group.some((s) => s.getStatus() === SubTaskStatus.REPROVADO);
        const hasAwaiting = group.some((s) => s.getStatus() === SubTaskStatus.AGUARDANDO_CHECKOUT);
        return allTerminal && (!hasReprovado || hasAwaiting);
      });

      if (!canCheckout) {
        this.status = TaskStatus.EM_EXECUCAO;
      }
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
  getFlows(): Flow[] {
    return this.flows;
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

  changeTaskNumber(taskNumber: string): void {
    this.taskNumber = taskNumber;
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

  changeApplicantId(applicantId: ApplicantId): void {
    this.applicantId = applicantId;
    this.validate();
  }

  addFlow(flow: Flow): void {
    this.flows.push(flow);
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
