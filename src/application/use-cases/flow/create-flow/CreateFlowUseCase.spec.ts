import { CreateFlowUseCase } from './CreateFlowUseCase';
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

describe('CreateFlowUseCase', () => {
  it('creates and saves flow', async () => {
    const repo = makeRepo();
    repo.save.mockImplementation(async (f: Flow) =>
      new Flow({ id: FlowId(1), name: f.getName() }),
    );
    const sut = new CreateFlowUseCase(repo);

    const output = await sut.execute({ name: 'Discovery' });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(output.name).toBe('Discovery');
    expect(output.id).toBe(1);
  });

  it('throws when name too short', async () => {
    const repo = makeRepo();
    const sut = new CreateFlowUseCase(repo);

    await expect(sut.execute({ name: 'AB' })).rejects.toThrow();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
