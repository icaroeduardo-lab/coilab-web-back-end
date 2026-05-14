import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class AddIssueDto {
  @ApiProperty({ example: 'Criar endpoint de autenticação' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://github.com/org/repo/issues/42' })
  @IsUrl()
  url: string;

  @ApiProperty({ example: 1, description: 'ID do flow (empresa responsável)' })
  @IsInt()
  @Min(1)
  flowId: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @ApiPropertyOptional({ example: 'Sprint 3' })
  @IsString()
  @IsOptional()
  sprint?: string;
}
