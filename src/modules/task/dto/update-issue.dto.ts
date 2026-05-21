import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'Sprint 3' })
  @IsString()
  @IsOptional()
  sprint?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'true = closed (completionDate registrada automaticamente), false = open',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
