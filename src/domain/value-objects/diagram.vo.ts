import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ValueObject } from './value-object.base';

export interface DiagramProps {
  title: string;
  description: string;
  urlDiagram: string;
}

export class Diagram extends ValueObject {
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
    super();
    this.title = props.title;
    this.description = props.description;
    this.urlDiagram = props.urlDiagram;
    this.validate();
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
