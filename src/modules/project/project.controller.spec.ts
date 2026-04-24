import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { CreateProjectUseCase } from '../../application/use-cases/project/create-project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../application/use-cases/project/get-project/GetProjectUseCase';
import { ListProjectsUseCase } from '../../application/use-cases/project/list-projects/ListProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/project/update-project/UpdateProjectUseCase';
import { ChangeProjectStatusUseCase } from '../../application/use-cases/project/change-project-status/ChangeProjectStatusUseCase';
import { ProjectStatus } from '../../domain/entities/project.entity';
import { randomUUID } from 'crypto';

const mockCreate = { execute: jest.fn() };
const mockGet = { execute: jest.fn() };
const mockList = { execute: jest.fn() };
const mockUpdate = { execute: jest.fn() };
const mockChangeStatus = { execute: jest.fn() };

describe('ProjectController', () => {
  let controller: ProjectController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        { provide: CreateProjectUseCase, useValue: mockCreate },
        { provide: GetProjectUseCase, useValue: mockGet },
        { provide: ListProjectsUseCase, useValue: mockList },
        { provide: UpdateProjectUseCase, useValue: mockUpdate },
        { provide: ChangeProjectStatusUseCase, useValue: mockChangeStatus },
      ],
    }).compile();
    controller = module.get(ProjectController);
  });

  describe('create', () => {
    it('calls createProject.execute with dto and returns result', async () => {
      const dto = { name: 'Projeto Alpha', description: 'Desc' };
      const output = { id: randomUUID(), name: 'Projeto Alpha' };
      mockCreate.execute.mockResolvedValue(output);
      const result = await controller.create(dto as never);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
      expect(result).toBe(output);
    });
  });

  describe('list', () => {
    it('calls listProjects.execute and returns result', async () => {
      const output = [{ id: randomUUID(), name: 'Projeto Alpha' }];
      mockList.execute.mockResolvedValue(output);
      const result = await controller.list();
      expect(mockList.execute).toHaveBeenCalled();
      expect(result).toBe(output);
    });
  });

  describe('get', () => {
    it('calls getProject.execute with id and returns result', async () => {
      const id = randomUUID();
      const output = { id, name: 'Projeto Alpha' };
      mockGet.execute.mockResolvedValue(output);
      const result = await controller.get(id);
      expect(mockGet.execute).toHaveBeenCalledWith({ id });
      expect(result).toBe(output);
    });
  });

  describe('update', () => {
    it('calls updateProject.execute with id and dto fields', async () => {
      mockUpdate.execute.mockResolvedValue(undefined);
      const id = randomUUID();
      const dto = { name: 'Novo Nome', description: 'Nova desc' };
      await controller.update(id, dto as never);
      expect(mockUpdate.execute).toHaveBeenCalledWith({ id, ...dto });
    });
  });

  describe('changeProjectStatus', () => {
    it('calls changeStatus.execute with id and status', async () => {
      mockChangeStatus.execute.mockResolvedValue(undefined);
      const id = randomUUID();
      const dto = { status: ProjectStatus.EM_EXECUCAO };
      await controller.changeProjectStatus(id, dto as never);
      expect(mockChangeStatus.execute).toHaveBeenCalledWith({
        id,
        status: ProjectStatus.EM_EXECUCAO,
      });
    });
  });
});
