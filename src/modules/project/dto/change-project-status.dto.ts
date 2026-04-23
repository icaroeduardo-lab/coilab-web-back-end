import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '../../../domain/entities/project.entity';

export class ChangeProjectStatusDto {
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;
}
