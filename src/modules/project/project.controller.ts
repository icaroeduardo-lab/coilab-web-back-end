import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateProjectUseCase } from '../../application/use-cases/project/create-project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../application/use-cases/project/get-project/GetProjectUseCase';
import { ListProjectsUseCase } from '../../application/use-cases/project/list-projects/ListProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/project/update-project/UpdateProjectUseCase';
import { ChangeProjectStatusUseCase } from '../../application/use-cases/project/change-project-status/ChangeProjectStatusUseCase';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(CreateProjectUseCase) private readonly createProject: CreateProjectUseCase,
    @Inject(GetProjectUseCase) private readonly getProject: GetProjectUseCase,
    @Inject(ListProjectsUseCase) private readonly listProjects: ListProjectsUseCase,
    @Inject(UpdateProjectUseCase) private readonly updateProject: UpdateProjectUseCase,
    @Inject(ChangeProjectStatusUseCase) private readonly changeStatus: ChangeProjectStatusUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.createProject.execute(dto);
  }

  @Get()
  list() {
    return this.listProjects.execute();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getProject.execute({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.updateProject.execute({ id, ...dto });
  }

  @Patch(':id/status')
  changeProjectStatus(@Param('id') id: string, @Body() dto: ChangeProjectStatusDto) {
    return this.changeStatus.execute({ id, status: dto.status });
  }
}
