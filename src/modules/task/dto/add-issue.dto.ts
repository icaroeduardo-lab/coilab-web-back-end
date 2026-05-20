import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { GitHubRepo } from '../../../domain/repositories/IGitHubService';

export class AddIssueDto {
  @ApiPropertyOptional({ example: 'Criar endpoint de autenticação' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    enum: ['front', 'back'],
    description: 'Repositório GitHub — obrigatório apenas para projetos coilab-web',
  })
  @IsIn(['front', 'back'])
  @IsOptional()
  repository?: GitHubRepo;

  @ApiPropertyOptional({ example: 'Descrição detalhada da issue.' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do flow (empresa responsável) — ignorado para projetos coilab-web (sempre 3)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  flowId?: number;

  @ApiPropertyOptional({
    example: 'Sprint 3',
    description: 'Apenas para projetos que não são coilab-web',
  })
  @IsString()
  @IsOptional()
  sprint?: string;
}
