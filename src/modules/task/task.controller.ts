import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task/CreateTaskUseCase';
import { GetTaskUseCase } from '../../application/use-cases/task/get-task/GetTaskUseCase';
import { ListAllTasksUseCase } from '../../application/use-cases/task/list-all-tasks/ListAllTasksUseCase';
import { ListTasksByProjectUseCase } from '../../application/use-cases/task/list-tasks-by-project/ListTasksByProjectUseCase';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task/UpdateTaskUseCase';
import { ChangeTaskStatusUseCase } from '../../application/use-cases/task/change-task-status/ChangeTaskStatusUseCase';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task/DeleteTaskUseCase';
import { AddSubTaskToTaskUseCase } from '../../application/use-cases/task/add-subtask-to-task/AddSubTaskToTaskUseCase';
import { ChangeSubTaskStatusUseCase } from '../../application/use-cases/task/change-subtask-status/ChangeSubTaskStatusUseCase';
import { UpdateDiscoveryFormUseCase } from '../../application/use-cases/task/update-discovery-form/UpdateDiscoveryFormUseCase';
import { AddDesignToSubTaskUseCase } from '../../application/use-cases/task/add-design-to-subtask/AddDesignToSubTaskUseCase';
import { RemoveDesignFromSubTaskUseCase } from '../../application/use-cases/task/remove-design-from-subtask/RemoveDesignFromSubTaskUseCase';
import { GetDesignUploadUrlUseCase } from '../../application/use-cases/task/get-design-upload-url/GetDesignUploadUrlUseCase';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { AddSubTaskDto } from './dto/add-subtask.dto';
import { ChangeSubTaskStatusDto } from './dto/change-subtask-status.dto';
import { UpdateDiscoveryFormDto } from './dto/update-discovery-form.dto';
import { AddDesignDto } from './dto/add-design.dto';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(
    @Inject(CreateTaskUseCase) private readonly createTask: CreateTaskUseCase,
    @Inject(GetTaskUseCase) private readonly getTask: GetTaskUseCase,
    @Inject(ListAllTasksUseCase) private readonly listAllTasks: ListAllTasksUseCase,
    @Inject(ListTasksByProjectUseCase) private readonly listByProject: ListTasksByProjectUseCase,
    @Inject(UpdateTaskUseCase) private readonly updateTask: UpdateTaskUseCase,
    @Inject(ChangeTaskStatusUseCase) private readonly changeTaskStatus: ChangeTaskStatusUseCase,
    @Inject(DeleteTaskUseCase) private readonly deleteTask: DeleteTaskUseCase,
    @Inject(AddSubTaskToTaskUseCase) private readonly addSubTask: AddSubTaskToTaskUseCase,
    @Inject(ChangeSubTaskStatusUseCase)
    private readonly changeSubTaskStatus: ChangeSubTaskStatusUseCase,
    @Inject(UpdateDiscoveryFormUseCase)
    private readonly updateDiscovery: UpdateDiscoveryFormUseCase,
    @Inject(AddDesignToSubTaskUseCase) private readonly addDesign: AddDesignToSubTaskUseCase,
    @Inject(RemoveDesignFromSubTaskUseCase)
    private readonly removeDesign: RemoveDesignFromSubTaskUseCase,
    @Inject(GetDesignUploadUrlUseCase)
    private readonly getDesignUploadUrl: GetDesignUploadUrlUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada.' })
  @ApiResponse({ status: 422, description: 'Dados inválidos.' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto) {
    return this.createTask.execute({
      ...dto,
      creatorId: user.sub,
      subTasks: dto.subTasks?.map((s) => ({
        ...s,
        idUser: user.sub,
        expectedDelivery: new Date(s.expectedDelivery),
      })),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Página de tarefas.' })
  list(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.listAllTasks.execute({ page: Number(page), limit: Number(limit) });
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar tarefas por projeto' })
  @ApiParam({ name: 'projectId', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Tarefas do projeto.' })
  listByProjectId(@Param('projectId') projectId: string) {
    return this.listByProject.execute({ projectId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  get(@Param('id') id: string) {
    return this.getTask.execute({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da tarefa' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada.' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.updateTask.execute({ id, ...dto });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status da tarefa' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa' })
  @ApiResponse({ status: 200, description: 'Status alterado.' })
  @ApiResponse({ status: 422, description: 'Transição de status inválida.' })
  changeStatus(@Param('id') id: string, @Body() dto: ChangeTaskStatusDto) {
    return this.changeTaskStatus.execute({ id, status: dto.status });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover tarefa' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa' })
  @ApiResponse({ status: 204, description: 'Tarefa removida.' })
  @ApiResponse({ status: 422, description: 'Tarefa não pode ser removida no estado atual.' })
  async remove(@Param('id') id: string) {
    await this.deleteTask.execute({ id });
  }

  @Post(':taskId/subtasks')
  @HttpCode(204)
  @ApiOperation({ summary: 'Adicionar subtarefa à tarefa' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiResponse({ status: 204, description: 'Subtarefa adicionada.' })
  @ApiResponse({ status: 422, description: 'Subtarefa inválida para o estado atual.' })
  async addSubTask_(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Body() dto: AddSubTaskDto,
  ) {
    await this.addSubTask.execute({
      taskId,
      typeId: dto.typeId,
      idUser: user.sub,
      expectedDelivery: new Date(dto.expectedDelivery),
    });
  }

  @Patch(':taskId/subtasks/:subTaskId/status')
  @HttpCode(204)
  @ApiOperation({ summary: 'Alterar status da subtarefa' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa' })
  @ApiResponse({ status: 204, description: 'Status alterado.' })
  @ApiResponse({ status: 422, description: 'Ação inválida para o estado atual.' })
  async changeSubTaskStatus_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: ChangeSubTaskStatusDto,
  ) {
    await this.changeSubTaskStatus.execute({
      taskId,
      subTaskId,
      action: dto.action,
      reason: dto.reason,
    });
  }

  @Patch(':taskId/subtasks/:subTaskId/discovery')
  @HttpCode(204)
  @ApiOperation({ summary: 'Preencher/atualizar formulário de Discovery' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa Discovery' })
  @ApiResponse({ status: 204, description: 'Formulário atualizado.' })
  async updateDiscovery_(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: UpdateDiscoveryFormDto,
  ) {
    await this.updateDiscovery.execute({
      taskId,
      subTaskId,
      userId: user.sub,
      fields: dto.fields ?? {},
    });
  }

  @Post(':taskId/subtasks/:subTaskId/designs')
  @HttpCode(201)
  @ApiOperation({ summary: 'Adicionar design à subtarefa Design' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa Design' })
  @ApiResponse({ status: 201, description: 'Design adicionado.' })
  @ApiResponse({ status: 422, description: 'Subtarefa já adicionada ou em estado inválido.' })
  async addDesign_(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: AddDesignDto,
  ) {
    return this.addDesign.execute({ taskId, subTaskId, userId: user.sub, ...dto });
  }

  @Get(':taskId/subtasks/:subTaskId/designs/upload-url')
  @ApiOperation({ summary: 'Obter URL pré-assinada para upload de imagem de design no S3' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa Design' })
  @ApiQuery({ name: 'filename', required: true, example: 'tela-login.png' })
  @ApiResponse({ status: 200, description: 'uploadUrl (PUT direto ao S3) e fileUrl (URL final).' })
  getDesignUploadUrl_(@Param('taskId') taskId: string, @Query('filename') filename: string) {
    return this.getDesignUploadUrl.execute({ taskId, filename });
  }

  @Delete(':taskId/subtasks/:subTaskId/designs/:designId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover design da subtarefa' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa Design' })
  @ApiParam({ name: 'designId', description: 'UUID do design' })
  @ApiResponse({ status: 204, description: 'Design removido.' })
  async removeDesign_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Param('designId') designId: string,
  ) {
    await this.removeDesign.execute({ taskId, subTaskId, designId });
  }
}
