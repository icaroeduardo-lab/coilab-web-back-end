import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateDiscoveryFormDto {
  @ApiPropertyOptional({
    description: 'Campos arbitrários do formulário de Discovery',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  fields?: Record<string, unknown>;
}
