import { ListFlowsUseCase } from './ListFlowsUseCase';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { Flow } from '../../../../domain/value-objects/flow.vo';
import { FlowId } from '../../../../domain/shared/entity-ids';
let nextId = 1;

const makeRepo = (): jest.Mocked<IFlowRepository> => ({
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeFlow = (name: string) => new Flow({ id: FlowId(nextId++), name });

describe('ListFlowsUseCase', () => {
  it('returns paginated output for all flows', async () => {
    const repo = makeRepo();
    const flows = [makeFlow('Discovery'), makeFlow('Design')];
    repo.findAll.mockResolvedValue(flows);
    repo.count.mockResolvedValue(2);
    const sut = new ListFlowsUseCase(repo);

    const result = await sut.execute();

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ id: flows[0].getId(), name: 'Discovery' });
    expect(result.data[1]).toEqual({ id: flows[1].getId(), name: 'Design' });
  });

  it('returns empty when no flows', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    repo.count.mockResolvedValue(0);
    const sut = new ListFlowsUseCase(repo);

    const result = await sut.execute();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
