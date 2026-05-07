import 'reflect-metadata';
import { IsDate, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { ValueObject } from './value-object.base';
import { DesignId, UserId } from '../shared/entity-ids';

export interface DesignProps {
  id: DesignId;
  title: string;
  description: string;
  urlImage: string;
  user: UserId;
  dateUpload: Date;
}

export class Design extends ValueObject {
  @IsUUID()
  @IsNotEmpty()
  private readonly id: DesignId;

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
  private readonly user: UserId;

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

  getId(): DesignId {
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

  getUser(): UserId {
    return this.user;
  }

  getDateUpload(): Date {
    return this.dateUpload;
  }
}
