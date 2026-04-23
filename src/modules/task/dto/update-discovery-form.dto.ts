import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Level, Frequency } from '../../../domain/entities/sub-task.entity';

export class UpdateDiscoveryFormDto {
  @ApiPropertyOptional({ enum: Level, enumName: 'Level' })
  @IsEnum(Level)
  @IsOptional()
  complexity?: Level;

  @ApiPropertyOptional({ example: 'Portal do Cliente' })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiPropertyOptional({ example: 'Usuários precisam de um fluxo simplificado de onboarding.' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ example: 'Dificuldade em encontrar funcionalidades essenciais.' })
  @IsString()
  @IsOptional()
  painPoints?: string;

  @ApiPropertyOptional({ enum: Frequency, enumName: 'Frequency' })
  @IsEnum(Frequency)
  @IsOptional()
  frequency?: Frequency;

  @ApiPropertyOptional({ example: 'Processo manual via planilhas compartilhadas.' })
  @IsString()
  @IsOptional()
  currentProcess?: string;

  @ApiPropertyOptional({ example: 'Perda de 2h/dia por colaborador.' })
  @IsString()
  @IsOptional()
  inactionCost?: string;

  @ApiPropertyOptional({ example: '500 solicitações/mês' })
  @IsString()
  @IsOptional()
  volume?: string;

  @ApiPropertyOptional({ example: '30 minutos por solicitação' })
  @IsString()
  @IsOptional()
  avgTime?: string;

  @ApiPropertyOptional({ enum: Level, enumName: 'Level' })
  @IsEnum(Level)
  @IsOptional()
  humanDependency?: Level;

  @ApiPropertyOptional({ example: 'Retrabalho em 40% dos casos por erros de entrada.' })
  @IsString()
  @IsOptional()
  rework?: string;

  @ApiPropertyOptional({ example: 'Tentativa com formulários Google em 2024 sem sucesso.' })
  @IsString()
  @IsOptional()
  previousAttempts?: string;

  @ApiPropertyOptional({ example: 'Concorrente X utiliza solução similar com sucesso.' })
  @IsString()
  @IsOptional()
  benchmark?: string;

  @ApiPropertyOptional({ enum: Level, enumName: 'Level' })
  @IsEnum(Level)
  @IsOptional()
  institutionalPriority?: Level;

  @ApiPropertyOptional({ example: 'Tecnicamente viável com a stack atual em 2 sprints.' })
  @IsString()
  @IsOptional()
  technicalOpinion?: string;
}
