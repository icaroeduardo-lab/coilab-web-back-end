import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Level, Frequency } from '../../../domain/entities/sub-task.entity';

export class UpdateDiscoveryFormDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(Level)
  @IsOptional()
  complexity?: Level;

  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  painPoints?: string;

  @IsEnum(Frequency)
  @IsOptional()
  frequency?: Frequency;

  @IsString()
  @IsOptional()
  currentProcess?: string;

  @IsString()
  @IsOptional()
  inactionCost?: string;

  @IsString()
  @IsOptional()
  volume?: string;

  @IsString()
  @IsOptional()
  avgTime?: string;

  @IsEnum(Level)
  @IsOptional()
  humanDependency?: Level;

  @IsString()
  @IsOptional()
  rework?: string;

  @IsString()
  @IsOptional()
  previousAttempts?: string;

  @IsString()
  @IsOptional()
  benchmark?: string;

  @IsEnum(Level)
  @IsOptional()
  institutionalPriority?: Level;

  @IsString()
  @IsOptional()
  technicalOpinion?: string;
}
