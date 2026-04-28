import 'reflect-metadata';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Entity } from './entity.base';
import { UserId } from '../shared/entity-ids';

export interface UserProps {
  id: UserId;
  name: string;
  email: string;
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
  @IsNotEmpty()
  private email: string;

  @IsString()
  @IsOptional()
  private imageUrl?: string;

  constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.imageUrl = props.imageUrl;
    this.validate();
  }

  getId(): UserId {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getEmail(): string {
    return this.email;
  }
  getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  syncProfile(name: string, email: string, imageUrl?: string): void {
    this.name = name;
    this.email = email;
    this.imageUrl = imageUrl;
    this.validate();
  }
}
