import 'reflect-metadata';
import { IsDate, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { ValueObject } from './value-object.base';

export interface DesignProps {
  id: string;
  title: string;
  description: string;
  urlImage: string;
  user: string;
  dateUpload: Date;
}

export class Design extends ValueObject {
  @IsUUID()
  @IsNotEmpty()
  private readonly id: string;

  @IsString()
  @IsNotEmpty()
  private readonly title: string;

  @IsString()
  @IsNotEmpty()
  private readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  private readonly urlImage: string;

  @IsUUID()
  @IsNotEmpty()
  private readonly user: string;

  @IsDate()
  @IsNotEmpty()
  private readonly dateUpload: Date;

  constructor(props: DesignProps) {
    super();
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.urlImage = props.urlImage;
    this.user = props.user;
    this.dateUpload = props.dateUpload;
    this.validate();
  }

  getId(): string {
    return this.id;
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

  getUser(): string {
    return this.user;
  }

  getDateUpload(): Date {
    return this.dateUpload;
  }
}
