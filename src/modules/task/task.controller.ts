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
import { AddIssueToSubTaskUseCase } from '../../application/use-cases/task/add-issue-to-subtask/AddIssueToSubTaskUseCase';
import { RemoveIssueFromSubTaskUseCase } from '../../application/use-cases/task/remove-issue-from-subtask/RemoveIssueFromSubTaskUseCase';
import { UpdateIssueInSubTaskUseCase } from '../../application/use-cases/task/update-issue-in-subtask/UpdateIssueInSubTaskUseCase';
import { ListTaskToolsUseCase } from '../../application/use-cases/task/list-task-tools/ListTaskToolsUseCase';
import { CompleteDevSubTaskUseCase } from '../../application/use-cases/task/complete-dev-subtask/CompleteDevSubTaskUseCase';
import { CancelDevSubTaskUseCase } from '../../application/use-cases/task/cancel-dev-subtask/CancelDevSubTaskUseCase';
import { AddChecklistItemUseCase } from '../../application/use-cases/task/add-checklist-item/AddChecklistItemUseCase';
import { RemoveChecklistItemUseCase } from '../../application/use-cases/task/remove-checklist-item/RemoveChecklistItemUseCase';
import { ToggleChecklistItemUseCase } from '../../application/use-cases/task/toggle-checklist-item/ToggleChecklistItemUseCase';
import { ReorderChecklistItemUseCase } from '../../application/use-cases/task/reorder-checklist-item/ReorderChecklistItemUseCase';
import { GetDashboardStatsUseCase } from '../../application/use-cases/task/get-dashboard-stats/GetDashboardStatsUseCase';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { AddSubTaskDto } from './dto/add-subtask.dto';
import { ChangeSubTaskStatusDto } from './dto/change-subtask-status.dto';
import { UpdateDiscoveryFormDto } from './dto/update-discovery-form.dto';
import { AddDesignDto } from './dto/add-design.dto';
import { AddIssueDto } from './dto/add-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { CancelDevSubTaskDto } from './dto/cancel-dev-subtask.dto';
import { AddChecklistItemDto } from './dto/add-checklist-item.dto';
import { ReorderChecklistItemDto } from './dto/reorder-checklist-item.dto';
import {
  TaskResponseDto,
  TaskListResponseDto,
  TaskDetailResponseDto,
} from './dto/task-response.dto';
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
    @Inject(AddIssueToSubTaskUseCase)
    private readonly addIssue: AddIssueToSubTaskUseCase,
    @Inject(RemoveIssueFromSubTaskUseCase)
    private readonly removeIssue: RemoveIssueFromSubTaskUseCase,
    @Inject(UpdateIssueInSubTaskUseCase)
    private readonly updateIssue: UpdateIssueInSubTaskUseCase,
    @Inject(ListTaskToolsUseCase)
    private readonly listTaskTools: ListTaskToolsUseCase,
    @Inject(CompleteDevSubTaskUseCase)
    private readonly completeDevSubTask: CompleteDevSubTaskUseCase,
    @Inject(CancelDevSubTaskUseCase)
    private readonly cancelDevSubTask: CancelDevSubTaskUseCase,
    @Inject(AddChecklistItemUseCase)
    private readonly addChecklistItem: AddChecklistItemUseCase,
    @Inject(RemoveChecklistItemUseCase)
    private readonly removeChecklistItem: RemoveChecklistItemUseCase,
    @Inject(ToggleChecklistItemUseCase)
    private readonly toggleChecklistItem: ToggleChecklistItemUseCase,
    @Inject(ReorderChecklistItemUseCase)
    private readonly reorderChecklistItem: ReorderChecklistItemUseCase,
    @Inject(GetDashboardStatsUseCase)
    private readonly getDashboardStats: GetDashboardStatsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada.', type: TaskResponseDto })
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

  @Get('tools')
  @ApiOperation({ summary: 'Listar tipos de subtask (task tools)' })
  @ApiResponse({ status: 200, description: 'Lista de task tools.' })
  listTools() {
    return this.listTaskTools.execute();
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas de tarefas.' })
  dashboardStats() {
    return this.getDashboardStats.execute();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Página de tarefas.', type: TaskListResponseDto })
  list(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.listAllTasks.execute({ page: Number(page), limit: Number(limit) });
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar tarefas por projeto' })
  @ApiParam({ name: 'projectId', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Tarefas do projeto.', type: [TaskListResponseDto] })
  listByProjectId(@Param('projectId') projectId: string) {
    return this.listByProject.execute({ projectId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada.', type: TaskDetailResponseDto })
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
    return this.addDesign.execute({
      taskId,
      subTaskId,
      user: { id: user.sub, name: user.name, avatar: user.picture },
      ...dto,
    });
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

  @Patch(':taskId/subtasks/:subTaskId/complete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Finalizar subtarefa de Desenvolvimento e fechar todas as issues abertas',
  })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa (typeId=4)' })
  @ApiResponse({ status: 204, description: 'Subtarefa finalizada e issues fechadas.' })
  @ApiResponse({ status: 422, description: 'Subtarefa inválida ou não é do tipo Desenvolvimento.' })
  async completeDevSubTask_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
  ) {
    await this.completeDevSubTask.execute({ taskId, subTaskId });
  }

  @Patch(':taskId/subtasks/:subTaskId/cancel')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Cancelar subtarefa de Desenvolvimento e reabrir todas as issues fechadas',
  })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa (typeId=4)' })
  @ApiResponse({ status: 204, description: 'Subtarefa cancelada e issues reabertas.' })
  @ApiResponse({ status: 422, description: 'Subtarefa inválida ou não é do tipo Desenvolvimento.' })
  async cancelDevSubTask_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: CancelDevSubTaskDto,
  ) {
    await this.cancelDevSubTask.execute({ taskId, subTaskId, reason: dto.reason });
  }

  @Post(':taskId/subtasks/:subTaskId/issues')
  @HttpCode(202)
  @ApiOperation({ summary: 'Adicionar issue à subtarefa de Desenvolvimento' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa (typeId=4)' })
  @ApiResponse({
    status: 202,
    description: 'Issue aceita — será criada no GitHub e registrada no banco.',
  })
  @ApiResponse({ status: 422, description: 'Subtarefa inválida ou não editável.' })
  async addIssue_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: AddIssueDto,
  ) {
    return this.addIssue.execute({ taskId, subTaskId, ...dto });
  }

  @Patch(':taskId/subtasks/:subTaskId/issues/:issueId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Editar issue da subtarefa de Desenvolvimento' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa' })
  @ApiParam({ name: 'issueId', description: 'UUID da issue' })
  @ApiResponse({ status: 204, description: 'Issue atualizada.' })
  @ApiResponse({ status: 422, description: 'Regra de negócio violada.' })
  async updateIssue_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Param('issueId') issueId: string,
    @Body() dto: UpdateIssueDto,
  ) {
    await this.updateIssue.execute({ taskId, subTaskId, issueId, ...dto });
  }

  @Delete(':taskId/subtasks/:subTaskId/issues/:issueId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover issue da subtarefa de Desenvolvimento' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'subTaskId', description: 'UUID da subtarefa' })
  @ApiParam({ name: 'issueId', description: 'UUID da issue' })
  @ApiResponse({ status: 204, description: 'Issue removida.' })
  @ApiResponse({ status: 422, description: 'Issue concluída não pode ser removida.' })
  async removeIssue_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Param('issueId') issueId: string,
  ) {
    await this.removeIssue.execute({ taskId, subTaskId, issueId });
  }

  @Post(':taskId/checklist')
  @HttpCode(204)
  @ApiOperation({ summary: 'Adicionar item ao checklist da tarefa' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiResponse({ status: 204, description: 'Item adicionado.' })
  @ApiResponse({ status: 422, description: 'Label inválido ou tarefa concluída.' })
  async addChecklistItem_(@Param('taskId') taskId: string, @Body() dto: AddChecklistItemDto) {
    await this.addChecklistItem.execute({ taskId, label: dto.label });
  }

  @Delete(':taskId/checklist/:itemId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover item do checklist da tarefa' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'itemId', description: 'UUID do item de checklist' })
  @ApiResponse({ status: 204, description: 'Item removido.' })
  @ApiResponse({ status: 422, description: 'Item não encontrado ou tarefa concluída.' })
  async removeChecklistItem_(@Param('taskId') taskId: string, @Param('itemId') itemId: string) {
    await this.removeChecklistItem.execute({ taskId, itemId });
  }

  @Patch(':taskId/checklist/:itemId/toggle')
  @HttpCode(204)
  @ApiOperation({ summary: 'Alternar estado checked do item de checklist' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'itemId', description: 'UUID do item de checklist' })
  @ApiResponse({ status: 204, description: 'Estado alternado.' })
  @ApiResponse({ status: 422, description: 'Item não encontrado ou tarefa concluída.' })
  async toggleChecklistItem_(@Param('taskId') taskId: string, @Param('itemId') itemId: string) {
    await this.toggleChecklistItem.execute({ taskId, itemId });
  }

  @Patch(':taskId/checklist/:itemId/order')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reordenar item do checklist' })
  @ApiParam({ name: 'taskId', description: 'UUID da tarefa' })
  @ApiParam({ name: 'itemId', description: 'UUID do item de checklist' })
  @ApiResponse({ status: 204, description: 'Ordem atualizada.' })
  @ApiResponse({ status: 422, description: 'Ordem inválida ou tarefa concluída.' })
  async reorderChecklistItem_(
    @Param('taskId') taskId: string,
    @Param('itemId') itemId: string,
    @Body() dto: ReorderChecklistItemDto,
  ) {
    await this.reorderChecklistItem.execute({ taskId, itemId, order: dto.order });
  }
}
