import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ClassValidatorStrategy } from '../validators/class-validator-strategy';

export interface DiscoveryProps {
  title: string;
  description: string;
  urlResearch: string;
}

export class Discovery {
  @IsString()
  @IsNotEmpty()
  private readonly title: string;

  @IsString()
  @IsNotEmpty()
  private readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  private readonly urlResearch: string;

  constructor(props: DiscoveryProps) {
    this.title = props.title;
    this.description = props.description;
    this.urlResearch = props.urlResearch;
    this.validate();
  }

  private validate() {
    const validator = new ClassValidatorStrategy<Discovery>();
    validator.validate(this);
  }

  getTitle(): string {
    return this.title;
  }
  getDescription(): string {
    return this.description;
  }
  getUrlResearch(): string {
    return this.urlResearch;
  }
}
