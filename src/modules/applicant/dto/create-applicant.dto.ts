import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
