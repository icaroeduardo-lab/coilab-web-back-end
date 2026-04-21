import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ValueObject } from './value-object.base';

export interface ApplicantProps {
  id: string;
  name: string;
}

export class Applicant extends ValueObject {
  @IsUUID()
  @IsNotEmpty()
  private readonly id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  private readonly name: string;

  constructor(props: ApplicantProps) {
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
