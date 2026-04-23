import { ListFlowsUseCase } from './ListFlowsUseCase';
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

const makeFlow = (name: string) =>
  new Flow({ id: FlowId(randomUUID()), name });

describe('ListFlowsUseCase', () => {
  it('returns mapped output for all flows', async () => {
    const repo = makeRepo();
    const flows = [makeFlow('Discovery'), makeFlow('Design')];
    repo.findAll.mockResolvedValue(flows);
    const sut = new ListFlowsUseCase(repo);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: flows[0].getId(), name: 'Discovery' });
    expect(result[1]).toEqual({ id: flows[1].getId(), name: 'Design' });
  });

  it('returns empty array when no flows', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    const sut = new ListFlowsUseCase(repo);

    const result = await sut.execute();

    expect(result).toEqual([]);
  });
});
