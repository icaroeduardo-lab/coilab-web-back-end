import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateApplicantDto {
  @ApiProperty({ example: 'Setor de Marketing' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
