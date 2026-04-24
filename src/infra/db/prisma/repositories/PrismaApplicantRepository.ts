import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../domain/shared/entity-ids';
import { prisma } from '../prisma.client';
import type { Applicant as PrismaApplicant } from '../../../../generated/prisma/client';

function toDomain(row: PrismaApplicant): Applicant {
  return new Applicant({ id: ApplicantId(row.id), name: row.name });
}

export class PrismaApplicantRepository implements IApplicantRepository {
  async findById(id: ApplicantId): Promise<Applicant | null> {
    const row = await prisma.applicant.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByIds(ids: ApplicantId[]): Promise<Applicant[]> {
    const rows = await prisma.applicant.findMany({ where: { id: { in: ids } } });
    return rows.map(toDomain);
  }

  async findAll(): Promise<Applicant[]> {
    const rows = await prisma.applicant.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toDomain);
  }

  async count(): Promise<number> {
    return prisma.applicant.count();
  }

  async save(applicant: Applicant): Promise<void> {
    await prisma.applicant.upsert({
      where: { id: applicant.getId() },
      create: { id: applicant.getId(), name: applicant.getName() },
      update: { name: applicant.getName() },
    });
  }

  async delete(id: ApplicantId): Promise<void> {
    await prisma.applicant.delete({ where: { id } });
  }
}
