import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateIssueDto {
  @ApiPropertyOptional({ example: 'Criar endpoint de autenticação' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Descrição detalhada da issue.' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  flowId?: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @ApiPropertyOptional({ example: 'Sprint 3' })
  @IsString()
  @IsOptional()
  sprint?: string;

  @ApiPropertyOptional({ example: true, description: 'true = closed, false = open' })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
