import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddChecklistItemDto {
  @ApiProperty({ example: 'Revisar requisitos' })
  @IsString()
  @IsNotEmpty()
  label: string;
}
