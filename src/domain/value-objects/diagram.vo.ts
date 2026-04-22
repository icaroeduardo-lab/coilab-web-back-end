import 'reflect-metadata';
import { IsDate, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { ValueObject } from './value-object.base';
import { ApplicantId } from '../shared/entity-ids';

export interface DiagramProps {
  title: string;
  description: string;
  urlDiagram: string;
  user: ApplicantId;
  dateUpload: Date;
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

  @IsUUID()
  @IsNotEmpty()
  private readonly user: ApplicantId;

  @IsDate()
  @IsNotEmpty()
  private readonly dateUpload: Date;

  constructor(props: DiagramProps) {
    super();
    this.title = props.title;
    this.description = props.description;
    this.urlDiagram = props.urlDiagram;
    this.user = props.user;
    this.dateUpload = props.dateUpload;
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

  getUser(): ApplicantId {
    return this.user;
  }

  getDateUpload(): Date {
    return this.dateUpload;
  }
}
