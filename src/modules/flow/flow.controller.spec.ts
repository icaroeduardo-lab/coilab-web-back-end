import { Test, TestingModule } from '@nestjs/testing';
import { FlowController } from './flow.controller';
import { CreateFlowUseCase } from '../../application/use-cases/flow/create-flow/CreateFlowUseCase';
import { ListFlowsUseCase } from '../../application/use-cases/flow/list-flows/ListFlowsUseCase';
import { DeleteFlowUseCase } from '../../application/use-cases/flow/delete-flow/DeleteFlowUseCase';
import { randomUUID } from 'crypto';

const mockCreate = { execute: jest.fn() };
const mockList = { execute: jest.fn() };
const mockDelete = { execute: jest.fn() };

describe('FlowController', () => {
  let controller: FlowController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowController],
      providers: [
        { provide: CreateFlowUseCase, useValue: mockCreate },
        { provide: ListFlowsUseCase, useValue: mockList },
        { provide: DeleteFlowUseCase, useValue: mockDelete },
      ],
    }).compile();
    controller = module.get(FlowController);
  });

  describe('create', () => {
    it('calls createFlow.execute with dto and returns result', async () => {
      const dto = { name: 'Fluxo A' };
      const output = { id: randomUUID(), name: 'Fluxo A' };
      mockCreate.execute.mockResolvedValue(output);
      const result = await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
      expect(result).toBe(output);
    });
  });

  describe('list', () => {
    it('calls listFlows.execute and returns result', async () => {
      const output = [{ id: randomUUID(), name: 'Fluxo A' }];
      mockList.execute.mockResolvedValue(output);
      const result = await controller.list();
      expect(mockList.execute).toHaveBeenCalled();
      expect(result).toBe(output);
    });
  });

  describe('remove', () => {
    it('calls deleteFlow.execute with id', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      const id = randomUUID();
      await controller.remove(id);
      expect(mockDelete.execute).toHaveBeenCalledWith({ id });
    });
  });
});
