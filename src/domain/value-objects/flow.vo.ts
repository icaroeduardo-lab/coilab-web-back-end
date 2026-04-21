import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ValueObject } from './value-object.base';

export interface FlowProps {
  id: string;
  name: string;
}

export class Flow extends ValueObject {
  @IsUUID()
  @IsNotEmpty()
  private readonly id: string;

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

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}
