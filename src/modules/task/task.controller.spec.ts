import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
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
import { TaskPriority, TaskStatus } from '../../domain/entities/task.entity';
import { SubTaskType } from '../../domain/entities/sub-task.entity';
import { JwtPayload } from '../auth/current-user.decorator';
import { randomUUID } from 'crypto';

const mockCreateTask = { execute: jest.fn() };
const mockGetTask = { execute: jest.fn() };
const mockListAll = { execute: jest.fn() };
const mockListByProject = { execute: jest.fn() };
const mockUpdateTask = { execute: jest.fn() };
const mockChangeTaskStatus = { execute: jest.fn() };
const mockDeleteTask = { execute: jest.fn() };
const mockAddSubTask = { execute: jest.fn() };
const mockChangeSubTaskStatus = { execute: jest.fn() };
const mockUpdateDiscovery = { execute: jest.fn() };
const mockAddDesign = { execute: jest.fn() };
const mockRemoveDesign = { execute: jest.fn() };
const mockGetDesignUploadUrl = { execute: jest.fn() };

const fakeUser: JwtPayload = { sub: randomUUID(), email: 'user@example.com' };

describe('TaskController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: CreateTaskUseCase, useValue: mockCreateTask },
        { provide: GetTaskUseCase, useValue: mockGetTask },
        { provide: ListAllTasksUseCase, useValue: mockListAll },
        { provide: ListTasksByProjectUseCase, useValue: mockListByProject },
        { provide: UpdateTaskUseCase, useValue: mockUpdateTask },
        { provide: ChangeTaskStatusUseCase, useValue: mockChangeTaskStatus },
        { provide: DeleteTaskUseCase, useValue: mockDeleteTask },
        { provide: AddSubTaskToTaskUseCase, useValue: mockAddSubTask },
        { provide: ChangeSubTaskStatusUseCase, useValue: mockChangeSubTaskStatus },
        { provide: UpdateDiscoveryFormUseCase, useValue: mockUpdateDiscovery },
        { provide: AddDesignToSubTaskUseCase, useValue: mockAddDesign },
        { provide: RemoveDesignFromSubTaskUseCase, useValue: mockRemoveDesign },
        { provide: GetDesignUploadUrlUseCase, useValue: mockGetDesignUploadUrl },
      ],
    }).compile();
    controller = module.get(TaskController);
  });

  describe('create', () => {
    it('calls createTask.execute with mapped dto and creatorId from token', async () => {
      const output = {
        id: randomUUID(),
        name: 'Task 1',
        taskNumber: '#20260001',
        priority: TaskPriority.MEDIA,
        status: TaskStatus.BACKLOG,
        projectId: randomUUID(),
      };
      mockCreateTask.execute.mockResolvedValue(output);
      const dto = {
        projectId: randomUUID(),
        name: 'Task 1',
        description: 'Desc',
        priority: TaskPriority.MEDIA,
        applicantId: randomUUID(),
      } as never;
      const result = await controller.create(fakeUser, dto);
      expect(mockCreateTask.execute).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Task 1', creatorId: fakeUser.sub }),
      );
      expect(result).toBe(output);
    });

    it('converts subTask expectedDelivery strings to Date and injects idUser from token', async () => {
      mockCreateTask.execute.mockResolvedValue({});
      const dateStr = '2026-12-31';
      const dto = {
        projectId: randomUUID(),
        name: 'T',
        description: 'D',
        priority: TaskPriority.MEDIA,
        applicantId: randomUUID(),
        subTasks: [{ type: SubTaskType.DISCOVERY, expectedDelivery: dateStr }],
      } as never;
      await controller.create(fakeUser, dto);
      const called = mockCreateTask.execute.mock.calls[0][0];
      expect(called.subTasks[0].expectedDelivery).toBeInstanceOf(Date);
      expect(called.subTasks[0].idUser).toBe(fakeUser.sub);
    });
  });

  describe('list', () => {
    it('calls listAllTasks.execute and returns result', async () => {
      const output = [{ id: randomUUID() }];
      mockListAll.execute.mockResolvedValue(output);
      const result = await controller.list();
      expect(mockListAll.execute).toHaveBeenCalled();
      expect(result).toBe(output);
    });
  });

  describe('listByProjectId', () => {
    it('calls listByProject.execute with projectId and returns result', async () => {
      const projectId = randomUUID();
      const output = [{ id: randomUUID() }];
      mockListByProject.execute.mockResolvedValue(output);
      const result = await controller.listByProjectId(projectId);
      expect(mockListByProject.execute).toHaveBeenCalledWith({ projectId });
      expect(result).toBe(output);
    });
  });

  describe('get', () => {
    it('calls getTask.execute with id and returns result', async () => {
      const id = randomUUID();
      const output = { id, name: 'Task 1' };
      mockGetTask.execute.mockResolvedValue(output);
      const result = await controller.get(id);
      expect(mockGetTask.execute).toHaveBeenCalledWith({ id });
      expect(result).toBe(output);
    });
  });

  describe('update', () => {
    it('calls updateTask.execute with id and dto and returns result', async () => {
      const id = randomUUID();
      const dto = { name: 'Novo nome' } as never;
      mockUpdateTask.execute.mockResolvedValue(undefined);
      await controller.update(id, dto);
      expect(mockUpdateTask.execute).toHaveBeenCalledWith({ id, name: 'Novo nome' });
    });
  });

  describe('changeStatus', () => {
    it('calls changeTaskStatus.execute with id and status', async () => {
      const id = randomUUID();
      const dto = { status: TaskStatus.EM_EXECUCAO } as never;
      mockChangeTaskStatus.execute.mockResolvedValue(undefined);
      await controller.changeStatus(id, dto);
      expect(mockChangeTaskStatus.execute).toHaveBeenCalledWith({
        id,
        status: TaskStatus.EM_EXECUCAO,
      });
    });
  });

  describe('remove', () => {
    it('calls deleteTask.execute with id', async () => {
      const id = randomUUID();
      mockDeleteTask.execute.mockResolvedValue(undefined);
      await controller.remove(id);
      expect(mockDeleteTask.execute).toHaveBeenCalledWith({ id });
    });
  });

  describe('addSubTask_', () => {
    it('calls addSubTask.execute with idUser from token and converted expectedDelivery', async () => {
      const taskId = randomUUID();
      const dateStr = '2026-12-31';
      const dto = { type: SubTaskType.DESIGN, expectedDelivery: dateStr } as never;
      mockAddSubTask.execute.mockResolvedValue(undefined);
      await controller.addSubTask_(fakeUser, taskId, dto);
      const called = mockAddSubTask.execute.mock.calls[0][0];
      expect(called.taskId).toBe(taskId);
      expect(called.type).toBe(SubTaskType.DESIGN);
      expect(called.idUser).toBe(fakeUser.sub);
      expect(called.expectedDelivery).toBeInstanceOf(Date);
    });
  });

  describe('changeSubTaskStatus_', () => {
    it('calls changeSubTaskStatus.execute with taskId, subTaskId and action', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const dto = { action: 'start' as const } as never;
      mockChangeSubTaskStatus.execute.mockResolvedValue(undefined);
      await controller.changeSubTaskStatus_(taskId, subTaskId, dto);
      expect(mockChangeSubTaskStatus.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        action: 'start',
        reason: undefined,
      });
    });
  });

  describe('updateDiscovery_', () => {
    it('passes userId from token and dto as fields', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const dto = { summary: 'Resumo' } as never;
      mockUpdateDiscovery.execute.mockResolvedValue(undefined);
      await controller.updateDiscovery_(fakeUser, taskId, subTaskId, dto);
      expect(mockUpdateDiscovery.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        userId: fakeUser.sub,
        fields: dto,
      });
    });
  });

  describe('addDesign_', () => {
    it('calls addDesign.execute with userId from token and dto spread', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const dto = {
        title: 'Tela',
        description: 'D',
        urlImage: 'https://img.example.com/a.png',
      } as never;
      mockAddDesign.execute.mockResolvedValue(undefined);
      await controller.addDesign_(fakeUser, taskId, subTaskId, dto);
      expect(mockAddDesign.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        userId: fakeUser.sub,
        title: 'Tela',
        description: 'D',
        urlImage: 'https://img.example.com/a.png',
      });
    });
  });

  describe('removeDesign_', () => {
    it('calls removeDesign.execute with taskId, subTaskId and designId', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const designId = randomUUID();
      mockRemoveDesign.execute.mockResolvedValue(undefined);
      await controller.removeDesign_(taskId, subTaskId, designId);
      expect(mockRemoveDesign.execute).toHaveBeenCalledWith({ taskId, subTaskId, designId });
    });
  });
});
