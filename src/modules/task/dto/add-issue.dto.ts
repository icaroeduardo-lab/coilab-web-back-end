import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { GitHubRepo } from '../../../domain/repositories/IGitHubService';

export class AddIssueDto {
  @ApiProperty({ example: 'Criar endpoint de autenticação' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    enum: ['front', 'back'],
    description: 'Repositório destino no GitHub',
  })
  @IsIn(['front', 'back'])
  repository: GitHubRepo;

  @ApiPropertyOptional({ example: 'Descrição detalhada da issue.' })
  @IsString()
  @IsOptional()
  body?: string;

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
