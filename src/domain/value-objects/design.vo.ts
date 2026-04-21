import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ValueObject } from './value-object.base';

export interface DesignProps {
  title: string;
  description: string;
  urlImage: string;
}

export class Design extends ValueObject {
  @IsString()
  @IsNotEmpty()
  private readonly title: string;

  @IsString()
  @IsNotEmpty()
  private readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  private readonly urlImage: string;

  constructor(props: DesignProps) {
    super();
    this.title = props.title;
    this.description = props.description;
    this.urlImage = props.urlImage;
    this.validate();
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getUrlImage(): string {
    return this.urlImage;
  }
}
