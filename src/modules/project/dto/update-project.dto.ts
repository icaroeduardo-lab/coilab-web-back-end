import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Portal do Cliente v2' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Escopo atualizado após reunião de alinhamento.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://docs.example.com/brief-v2.pdf' })
  @IsString()
  @IsOptional()
  urlDocument?: string;
}
