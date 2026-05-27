import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReorderChecklistItemDto {
  @ApiProperty({ example: 2, description: 'Nova posição do item (inteiro >= 0)' })
  @IsInt()
  @Min(0)
  order: number;
}
