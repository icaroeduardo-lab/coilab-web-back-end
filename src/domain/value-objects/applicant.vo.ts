import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ClassValidatorStrategy } from '../validators/class-validator-strategy';

export interface ApplicantProps {
  id: string;
  name: string;
}

export class Applicant {
  @IsUUID()
  @IsNotEmpty()
  private readonly id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  private readonly name: string;

  constructor(props: ApplicantProps) {
    this.id = props.id;
    this.name = props.name;
    this.validate();
  }

  private validate() {
    const validator = new ClassValidatorStrategy<Applicant>();
    validator.validate(this);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}
