import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ValueObject } from './value-object.base';

export interface DiscoveryProps {
  title: string;
  description: string;
  urlResearch: string;
}

export class Discovery extends ValueObject {
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
    super();
    this.title = props.title;
    this.description = props.description;
    this.urlResearch = props.urlResearch;
    this.validate();
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
