import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { Flow } from '../../../../domain/value-objects/flow.vo';
import { FlowId } from '../../../../domain/shared/entity-ids';
import { prisma } from '../prisma.client';
import type { Flow as PrismaFlow } from '../../../../generated/prisma/client';

function toDomain(row: PrismaFlow): Flow {
  return new Flow({ id: FlowId(row.id), name: row.name });
}

export class PrismaFlowRepository implements IFlowRepository {
  async findByIds(ids: FlowId[]): Promise<Flow[]> {
    const rows = await prisma.flow.findMany({ where: { id: { in: ids } } });
    return rows.map(toDomain);
  }

  async findAll(): Promise<Flow[]> {
    const rows = await prisma.flow.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toDomain);
  }

  async count(): Promise<number> {
    return prisma.flow.count();
  }

  async save(flow: Flow): Promise<Flow> {
    const id = flow.getId();
    if (id === 0) {
      const row = await prisma.flow.create({ data: { name: flow.getName() } });
      return toDomain(row);
    }
    const row = await prisma.flow.update({
      where: { id },
      data: { name: flow.getName() },
    });
    return toDomain(row);
  }

  async delete(id: FlowId): Promise<void> {
    await prisma.flow.delete({ where: { id } });
  }
}
