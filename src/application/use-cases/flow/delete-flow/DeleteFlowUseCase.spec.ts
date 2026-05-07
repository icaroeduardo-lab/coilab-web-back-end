import { DeleteFlowUseCase } from './DeleteFlowUseCase';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { Flow } from '../../../../domain/value-objects/flow.vo';
import { FlowId } from '../../../../domain/shared/entity-ids';
const makeRepo = (): jest.Mocked<IFlowRepository> => ({
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('DeleteFlowUseCase', () => {
  it('deletes flow by id', async () => {
    const repo = makeRepo();
    const id = '1';
    repo.findByIds.mockResolvedValue([new Flow({ id: FlowId(1), name: 'Discovery' })]);
    const sut = new DeleteFlowUseCase(repo);

    await sut.execute({ id });

    expect(repo.delete).toHaveBeenCalledWith(FlowId(1));
  });

  it('throws when flow not found', async () => {
    const repo = makeRepo();
    repo.findByIds.mockResolvedValue([]);
    const sut = new DeleteFlowUseCase(repo);

    await expect(sut.execute({ id: '999' })).rejects.toThrow('Flow not found');
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
