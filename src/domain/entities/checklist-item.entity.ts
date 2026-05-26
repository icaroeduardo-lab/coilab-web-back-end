import 'reflect-metadata';
import { IsBoolean, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { Entity } from './entity.base';
import { DomainException } from '../shared/domain.exception';

export interface ChecklistItemProps {
  id: string;
  label: string;
  checked: boolean;
  order: number;
}

export class ChecklistItem extends Entity {
  @IsUUID()
  private id: string;

  @IsString()
  @IsNotEmpty()
  private label: string;

  @IsBoolean()
  private checked: boolean;

  @IsInt()
  @Min(0)
  private order: number;

  constructor(props: ChecklistItemProps) {
    super();
    if (!props.label || !props.label.trim()) {
      throw new DomainException('Label do item de checklist não pode ser vazio');
    }
    this.id = props.id;
    this.label = props.label.trim();
    this.checked = props.checked;
    this.order = props.order;
    this.validate();
  }

  getId(): string {
    return this.id;
  }

  getLabel(): string {
    return this.label;
  }

  isChecked(): boolean {
    return this.checked;
  }

  getOrder(): number {
    return this.order;
  }

  toggle(): void {
    this.checked = !this.checked;
  }

  updateOrder(order: number): void {
    if (!Number.isInteger(order) || order < 0) {
      throw new DomainException('Ordem do item de checklist deve ser um inteiro não negativo');
    }
    this.order = order;
    this.validate();
  }
}
