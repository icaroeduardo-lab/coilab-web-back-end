import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CanvasDto } from './canvas.dto';

export class CreateProjectDto {
  @ApiProperty({ example: 'Portal do Cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Redesign completo do portal de clientes da empresa.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ type: CanvasDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CanvasDto)
  canvas?: CanvasDto;
}
