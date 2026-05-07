import 'reflect-metadata';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Entity } from './entity.base';
import { ApplicantId } from '../shared/entity-ids';

export interface ApplicantProps {
  id: ApplicantId;
  name: string;
}

export class Applicant extends Entity {
  @IsInt()
  @Min(0)
  private id: ApplicantId;

  @IsString()
  @IsNotEmpty()
  private name: string;

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

  changeName(name: string): void {
    this.name = name;
    this.validate();
  }
}
