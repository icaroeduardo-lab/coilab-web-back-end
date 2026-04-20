import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ClassValidatorStrategy } from '../validators/class-validator-strategy';

export interface DiagramProps {
  title: string;
  description: string;
  urlDiagram: string;
}

export class Diagram {
  @IsString()
  @IsNotEmpty()
  private readonly title: string;

  @IsString()
  @IsNotEmpty()
  private readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  private readonly urlDiagram: string;

  constructor(props: DiagramProps) {
    this.title = props.title;
    this.description = props.description;
    this.urlDiagram = props.urlDiagram;
    this.validate();
  }

  private validate() {
    const validator = new ClassValidatorStrategy<Diagram>();
    validator.validate(this);
  }

  getTitle(): string {
    return this.title;
  }
  getDescription(): string {
    return this.description;
  }
  getUrlDiagram(): string {
    return this.urlDiagram;
  }
}
