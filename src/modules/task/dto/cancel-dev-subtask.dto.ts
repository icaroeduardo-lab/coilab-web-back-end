import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelDevSubTaskDto {
  @ApiProperty({ example: 'Mudança de escopo do projeto.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
