import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '../../../domain/entities/project.entity';

export class ChangeProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus, enumName: 'ProjectStatus' })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;
}
