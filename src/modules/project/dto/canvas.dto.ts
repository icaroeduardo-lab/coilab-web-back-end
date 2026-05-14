import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CanvasImpactDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}

export class CanvasPartDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: string;
}

export class CanvasResourceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  description?: string[];
}

export class CanvasRiskAndMitigationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  risk?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mitigation?: string;
}

export class CanvasTeamMemberDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isLead?: boolean;
}

export class CanvasDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  problem?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  target?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objective?: string[];

  @ApiPropertyOptional({ type: CanvasImpactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CanvasImpactDto)
  impact?: CanvasImpactDto;

  @ApiPropertyOptional({ type: [CanvasPartDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanvasPartDto)
  parts?: CanvasPartDto[];

  @ApiPropertyOptional({ type: [CanvasResourceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanvasResourceDto)
  resources?: CanvasResourceDto[];

  @ApiPropertyOptional({ type: [CanvasRiskAndMitigationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanvasRiskAndMitigationDto)
  risksAndMitigation?: CanvasRiskAndMitigationDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  indicators?: string[];

  @ApiPropertyOptional({ type: [CanvasTeamMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanvasTeamMemberDto)
  team?: CanvasTeamMemberDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
