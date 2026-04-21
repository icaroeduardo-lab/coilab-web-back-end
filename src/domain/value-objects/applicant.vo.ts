import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ValueObject } from './value-object.base';
import { ApplicantId } from './entity-ids';

export interface ApplicantProps {
  id: ApplicantId;
  name: string;
}

export class Applicant extends ValueObject {
  @IsUUID()
  @IsNotEmpty()
  private readonly id: ApplicantId;

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

  getId(): ApplicantId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}
