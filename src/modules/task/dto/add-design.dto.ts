import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class AddDesignDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  urlImage: string;
}
