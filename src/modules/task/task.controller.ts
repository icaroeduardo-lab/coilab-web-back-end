import {
  Body, Controller, Delete, Get, HttpCode,
  Inject, Param, Patch, Post,
} from '@nestjs/common';
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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { AddSubTaskDto } from './dto/add-subtask.dto';
import { ChangeSubTaskStatusDto } from './dto/change-subtask-status.dto';
import { UpdateDiscoveryFormDto } from './dto/update-discovery-form.dto';
import { AddDesignDto } from './dto/add-design.dto';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

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
    @Inject(ChangeSubTaskStatusUseCase) private readonly changeSubTaskStatus: ChangeSubTaskStatusUseCase,
    @Inject(UpdateDiscoveryFormUseCase) private readonly updateDiscovery: UpdateDiscoveryFormUseCase,
    @Inject(AddDesignToSubTaskUseCase) private readonly addDesign: AddDesignToSubTaskUseCase,
    @Inject(RemoveDesignFromSubTaskUseCase) private readonly removeDesign: RemoveDesignFromSubTaskUseCase,
  ) {}

  @Post()
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
  list() {
    return this.listAllTasks.execute();
  }

  @Get('project/:projectId')
  listByProjectId(@Param('projectId') projectId: string) {
    return this.listByProject.execute({ projectId });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getTask.execute({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.updateTask.execute({ id, ...dto });
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeTaskStatusDto) {
    return this.changeTaskStatus.execute({ id, status: dto.status });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteTask.execute({ id });
  }

  @Post(':taskId/subtasks')
  @HttpCode(204)
  async addSubTask_(@CurrentUser() user: JwtPayload, @Param('taskId') taskId: string, @Body() dto: AddSubTaskDto) {
    await this.addSubTask.execute({
      taskId,
      type: dto.type,
      idUser: user.sub,
      expectedDelivery: new Date(dto.expectedDelivery),
    });
  }

  @Patch(':taskId/subtasks/:subTaskId/status')
  @HttpCode(204)
  async changeSubTaskStatus_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: ChangeSubTaskStatusDto,
  ) {
    await this.changeSubTaskStatus.execute({ taskId, subTaskId, action: dto.action, reason: dto.reason });
  }

  @Patch(':taskId/subtasks/:subTaskId/discovery')
  @HttpCode(204)
  async updateDiscovery_(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: UpdateDiscoveryFormDto,
  ) {
    await this.updateDiscovery.execute({ taskId, subTaskId, userId: user.sub, fields: dto });
  }

  @Post(':taskId/subtasks/:subTaskId/designs')
  @HttpCode(204)
  async addDesign_(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body() dto: AddDesignDto,
  ) {
    await this.addDesign.execute({ taskId, subTaskId, userId: user.sub, ...dto });
  }

  @Delete(':taskId/subtasks/:subTaskId/designs/:designId')
  @HttpCode(204)
  async removeDesign_(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Param('designId') designId: string,
  ) {
    await this.removeDesign.execute({ taskId, subTaskId, designId });
  }
}
