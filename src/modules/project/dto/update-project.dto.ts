import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CanvasDto } from './canvas.dto';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Portal do Cliente v2' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Escopo atualizado após reunião de alinhamento.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: CanvasDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CanvasDto)
  canvas?: CanvasDto;
}
