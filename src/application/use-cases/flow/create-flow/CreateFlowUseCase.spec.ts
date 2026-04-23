import { CreateFlowUseCase } from './CreateFlowUseCase';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { Flow } from '../../../../domain/value-objects/flow.vo';

const makeRepo = (): jest.Mocked<IFlowRepository> => ({
  findByIds: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CreateFlowUseCase', () => {
  it('creates and saves flow', async () => {
    const repo = makeRepo();
    const sut = new CreateFlowUseCase(repo);

    const output = await sut.execute({ name: 'Discovery' });

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved: Flow = repo.save.mock.calls[0][0];
    expect(saved.getName()).toBe('Discovery');
    expect(output.name).toBe('Discovery');
    expect(output.id).toBe(saved.getId());
  });

  it('throws when name too short', async () => {
    const repo = makeRepo();
    const sut = new CreateFlowUseCase(repo);

    await expect(sut.execute({ name: 'AB' })).rejects.toThrow();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
