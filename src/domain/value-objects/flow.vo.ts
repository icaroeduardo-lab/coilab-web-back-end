import 'reflect-metadata';
import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';
import { ValueObject } from './value-object.base';
import { FlowId } from '../shared/entity-ids';

export interface FlowProps {
  id: FlowId;
  name: string;
}

export class Flow extends ValueObject {
  @IsInt()
  @Min(0)
  private readonly id: FlowId;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  private readonly name: string;

  constructor(props: FlowProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.validate();
  }

  getId(): FlowId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}
