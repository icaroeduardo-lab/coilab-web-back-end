import { randomUUID } from 'crypto';
import { PrismaFlowRepository } from '../PrismaFlowRepository';
import { Flow } from '../../../../../domain/value-objects/flow.vo';
import { FlowId } from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const repo = new PrismaFlowRepository();

const makeFlow = (name = 'Flow A') => new Flow({ id: FlowId(randomUUID()), name });

beforeEach(truncateAll);

describe('PrismaFlowRepository', () => {
  it('saves and retrieves flows by ids', async () => {
    const flow = makeFlow();
    await repo.save(flow);

    const found = await repo.findByIds([flow.getId()]);
    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe(flow.getId());
  });

  it('findByIds returns empty array for unknown ids', async () => {
    const result = await repo.findByIds([FlowId(randomUUID())]);
    expect(result).toHaveLength(0);
  });

  it('upsert updates existing flow', async () => {
    const flow = makeFlow('Nome Antigo');
    await repo.save(flow);
    const updated = new Flow({ id: flow.getId(), name: 'Nome Novo' });
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
    const flow = makeFlow();
    await repo.save(flow);
    await repo.delete(flow.getId());

    const all = await repo.findAll();
    expect(all).toHaveLength(0);
  });
});
