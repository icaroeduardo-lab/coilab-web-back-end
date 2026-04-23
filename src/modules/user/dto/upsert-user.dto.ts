import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertUserDto {
  @IsUUID()
  @IsNotEmpty()
  cognitoSub: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
