import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class UpdateIssueDto {
  @ApiPropertyOptional({ example: 'Criar endpoint de autenticação' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'https://github.com/org/repo/issues/42' })
  @IsUrl()
  @IsOptional()
  url?: string;

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

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
