import 'reflect-metadata';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Entity } from './entity.base';
import { UserId } from '../shared/entity-ids';

export interface UserProps {
  id: UserId;
  name: string;
  imageUrl?: string;
}

export class User extends Entity {
  @IsUUID()
  @IsNotEmpty()
  private id: UserId;

  @IsString()
  @IsNotEmpty()
  private name: string;

  @IsString()
  @IsOptional()
  private imageUrl?: string;

  constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.imageUrl = props.imageUrl;
    this.validate();
  }

  getId(): UserId {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  syncProfile(name: string, imageUrl?: string): void {
    this.name = name;
    this.imageUrl = imageUrl;
    this.validate();
  }
}
