import { DeleteFlowUseCase } from './DeleteFlowUseCase';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { Flow } from '../../../../domain/value-objects/flow.vo';
import { FlowId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IFlowRepository> => ({
  findByIds: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('DeleteFlowUseCase', () => {
  it('deletes flow by id', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findByIds.mockResolvedValue([new Flow({ id: FlowId(id), name: 'Discovery' })]);
    const sut = new DeleteFlowUseCase(repo);

    await sut.execute({ id });

    expect(repo.delete).toHaveBeenCalledWith(id);
  });

  it('throws when flow not found', async () => {
    const repo = makeRepo();
    repo.findByIds.mockResolvedValue([]);
    const sut = new DeleteFlowUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Flow not found');
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
