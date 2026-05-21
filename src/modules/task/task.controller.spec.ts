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
import { AddIssueToSubTaskUseCase } from '../../application/use-cases/task/add-issue-to-subtask/AddIssueToSubTaskUseCase';
import { RemoveIssueFromSubTaskUseCase } from '../../application/use-cases/task/remove-issue-from-subtask/RemoveIssueFromSubTaskUseCase';
import { UpdateIssueInSubTaskUseCase } from '../../application/use-cases/task/update-issue-in-subtask/UpdateIssueInSubTaskUseCase';
import { ListTaskToolsUseCase } from '../../application/use-cases/task/list-task-tools/ListTaskToolsUseCase';
import { CompleteDevSubTaskUseCase } from '../../application/use-cases/task/complete-dev-subtask/CompleteDevSubTaskUseCase';
import { CancelDevSubTaskUseCase } from '../../application/use-cases/task/cancel-dev-subtask/CancelDevSubTaskUseCase';
import { TaskPriority, TaskStatus } from '../../domain/entities/task.entity';
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
const mockAddIssue = { execute: jest.fn() };
const mockRemoveIssue = { execute: jest.fn() };
const mockUpdateIssue = { execute: jest.fn() };
const mockListTaskTools = { execute: jest.fn() };
const mockCompleteDevSubTask = { execute: jest.fn() };
const mockCancelDevSubTask = { execute: jest.fn() };

const fakeUser: JwtPayload = {
  sub: randomUUID(),
  email: 'user@example.com',
  name: 'Test User',
};

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
        { provide: AddIssueToSubTaskUseCase, useValue: mockAddIssue },
        { provide: RemoveIssueFromSubTaskUseCase, useValue: mockRemoveIssue },
        { provide: UpdateIssueInSubTaskUseCase, useValue: mockUpdateIssue },
        { provide: ListTaskToolsUseCase, useValue: mockListTaskTools },
        { provide: CompleteDevSubTaskUseCase, useValue: mockCompleteDevSubTask },
        { provide: CancelDevSubTaskUseCase, useValue: mockCancelDevSubTask },
      ],
    }).compile();
    controller = module.get(TaskController);
  });

  describe('create', () => {
    it('calls createTask.execute with mapped dto and creatorId from token', async () => {
      const output = {
        id: randomUUID(),
        name: 'Task 1',
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
        subTasks: [{ typeId: 1, expectedDelivery: dateStr }],
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
      const dto = { typeId: 2, expectedDelivery: dateStr } as never;
      mockAddSubTask.execute.mockResolvedValue(undefined);
      await controller.addSubTask_(fakeUser, taskId, dto);
      const called = mockAddSubTask.execute.mock.calls[0][0];
      expect(called.taskId).toBe(taskId);
      expect(called.typeId).toBe(2);
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
    it('passes userId from token and dto.fields as fields', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const fields = { summary: 'Resumo' };
      const dto = { fields } as never;
      mockUpdateDiscovery.execute.mockResolvedValue(undefined);
      await controller.updateDiscovery_(fakeUser, taskId, subTaskId, dto);
      expect(mockUpdateDiscovery.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        userId: fakeUser.sub,
        fields,
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

  describe('listTools', () => {
    it('calls listTaskTools.execute and returns result', async () => {
      const output = [{ id: 1, name: 'Desenvolvimento' }];
      mockListTaskTools.execute.mockResolvedValue(output);
      const result = await controller.listTools();
      expect(mockListTaskTools.execute).toHaveBeenCalled();
      expect(result).toBe(output);
    });
  });

  describe('getDesignUploadUrl_', () => {
    it('calls getDesignUploadUrl.execute with taskId and filename', async () => {
      const taskId = randomUUID();
      const output = {
        uploadUrl: 'https://s3.example.com/upload',
        fileUrl: 'https://s3.example.com/file',
      };
      mockGetDesignUploadUrl.execute.mockResolvedValue(output);
      const result = await controller.getDesignUploadUrl_(taskId, 'tela-login.png');
      expect(mockGetDesignUploadUrl.execute).toHaveBeenCalledWith({
        taskId,
        filename: 'tela-login.png',
      });
      expect(result).toBe(output);
    });
  });

  describe('addIssue_', () => {
    it('calls addIssue.execute with taskId, subTaskId and dto', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const dto = { title: 'Nova issue', repository: 'front' as const } as never;
      const output = { id: randomUUID(), url: 'https://github.com/org/repo/issues/1' };
      mockAddIssue.execute.mockResolvedValue(output);
      const result = await controller.addIssue_(taskId, subTaskId, dto);
      expect(mockAddIssue.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        title: 'Nova issue',
        repository: 'front',
      });
      expect(result).toBe(output);
    });
  });

  describe('updateIssue_', () => {
    it('calls updateIssue.execute with taskId, subTaskId, issueId and dto', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const issueId = randomUUID();
      const dto = { title: 'Título atualizado' } as never;
      mockUpdateIssue.execute.mockResolvedValue(undefined);
      await controller.updateIssue_(taskId, subTaskId, issueId, dto);
      expect(mockUpdateIssue.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        issueId,
        title: 'Título atualizado',
      });
    });
  });

  describe('removeIssue_', () => {
    it('calls removeIssue.execute with taskId, subTaskId and issueId', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const issueId = randomUUID();
      mockRemoveIssue.execute.mockResolvedValue(undefined);
      await controller.removeIssue_(taskId, subTaskId, issueId);
      expect(mockRemoveIssue.execute).toHaveBeenCalledWith({ taskId, subTaskId, issueId });
    });
  });

  describe('completeDevSubTask_', () => {
    it('calls completeDevSubTask.execute with taskId and subTaskId', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      mockCompleteDevSubTask.execute.mockResolvedValue(undefined);
      await controller.completeDevSubTask_(taskId, subTaskId);
      expect(mockCompleteDevSubTask.execute).toHaveBeenCalledWith({ taskId, subTaskId });
    });
  });

  describe('cancelDevSubTask_', () => {
    it('calls cancelDevSubTask.execute with taskId, subTaskId and reason', async () => {
      const taskId = randomUUID();
      const subTaskId = randomUUID();
      const dto = { reason: 'Mudança de escopo' } as never;
      mockCancelDevSubTask.execute.mockResolvedValue(undefined);
      await controller.cancelDevSubTask_(taskId, subTaskId, dto);
      expect(mockCancelDevSubTask.execute).toHaveBeenCalledWith({
        taskId,
        subTaskId,
        reason: 'Mudança de escopo',
      });
    });
  });
});
