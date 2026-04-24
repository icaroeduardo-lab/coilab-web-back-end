import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProjectUseCase } from '../../application/use-cases/project/create-project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../application/use-cases/project/get-project/GetProjectUseCase';
import { ListProjectsUseCase } from '../../application/use-cases/project/list-projects/ListProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/project/update-project/UpdateProjectUseCase';
import { ChangeProjectStatusUseCase } from '../../application/use-cases/project/change-project-status/ChangeProjectStatusUseCase';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';

@ApiTags('Projects')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Criar projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso.' })
  @ApiResponse({ status: 422, description: 'Dados inválidos.' })
  create(@Body() dto: CreateProjectDto) {
    return this.createProject.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar projetos (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Página de projetos.' })
  list(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.listProjects.execute({ page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  get(@Param('id') id: string) {
    return this.getProject.execute({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do projeto' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado.' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.updateProject.execute({ id, ...dto });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do projeto' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Status alterado.' })
  @ApiResponse({ status: 422, description: 'Transição de status inválida.' })
  changeProjectStatus(@Param('id') id: string, @Body() dto: ChangeProjectStatusDto) {
    return this.changeStatus.execute({ id, status: dto.status });
  }
}
