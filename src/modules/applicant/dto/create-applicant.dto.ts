import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApplicantDto {
  @ApiProperty({ example: 'Setor de TI' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
