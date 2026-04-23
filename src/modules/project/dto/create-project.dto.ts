import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Portal do Cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Redesign completo do portal de clientes da empresa.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'https://docs.example.com/brief.pdf' })
  @IsString()
  @IsOptional()
  urlDocument?: string;
}
