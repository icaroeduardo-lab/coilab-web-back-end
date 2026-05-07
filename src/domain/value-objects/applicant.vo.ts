import 'reflect-metadata';
import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';
import { ValueObject } from './value-object.base';
import { ApplicantId } from '../shared/entity-ids';

export interface ApplicantProps {
  id: ApplicantId;
  name: string;
}

export class Applicant extends ValueObject {
  @IsInt()
  @Min(0)
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
