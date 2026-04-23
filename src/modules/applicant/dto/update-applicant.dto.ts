import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateApplicantDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
