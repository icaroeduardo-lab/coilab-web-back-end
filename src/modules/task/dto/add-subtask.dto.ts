import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class AddSubTaskDto {
  @ApiProperty({ example: 1, description: 'ID do tipo de subtarefa (TaskToolId)' })
  @IsInt()
  @Min(1)
  typeId: number;

  @ApiProperty({ example: '2026-12-31', description: 'Data esperada de entrega (ISO 8601)' })
  @IsDateString()
  expectedDelivery: string;
}
