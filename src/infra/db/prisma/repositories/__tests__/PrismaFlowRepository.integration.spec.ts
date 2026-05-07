import { PrismaFlowRepository } from '../PrismaFlowRepository';
import { Flow } from '../../../../../domain/value-objects/flow.vo';
import { FlowId } from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const repo = new PrismaFlowRepository();

const makeFlow = (name = 'Flow A') => new Flow({ id: FlowId(0), name });

beforeEach(truncateAll);

describe('PrismaFlowRepository', () => {
  it('saves and retrieves flows by ids', async () => {
    const saved = await repo.save(makeFlow());

    const found = await repo.findByIds([saved.getId()]);
    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe(saved.getId());
  });

  it('findByIds returns empty array for unknown ids', async () => {
    const result = await repo.findByIds([FlowId(99999)]);
    expect(result).toHaveLength(0);
  });

  it('upsert updates existing flow', async () => {
    const saved = await repo.save(makeFlow('Nome Antigo'));
    const updated = new Flow({ id: saved.getId(), name: 'Nome Novo' });
    await repo.save(updated);

    const all = await repo.findAll();
    expect(all[0].getName()).toBe('Nome Novo');
  });

  it('findAll returns all flows ordered by name', async () => {
    await repo.save(makeFlow('Zebra'));
    await repo.save(makeFlow('Alpha'));

    const all = await repo.findAll();
    expect(all[0].getName()).toBe('Alpha');
    expect(all[1].getName()).toBe('Zebra');
  });

  it('delete removes flow', async () => {
    const saved = await repo.save(makeFlow());
    await repo.delete(saved.getId());

    const all = await repo.findAll();
    expect(all).toHaveLength(0);
  });
});
