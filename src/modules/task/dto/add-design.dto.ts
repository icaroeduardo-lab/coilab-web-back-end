import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddDesignDto {
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
