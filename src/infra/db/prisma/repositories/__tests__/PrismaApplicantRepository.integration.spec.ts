import { randomUUID } from 'crypto';
import { PrismaApplicantRepository } from '../PrismaApplicantRepository';
import { Applicant } from '../../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const repo = new PrismaApplicantRepository();

const makeApplicant = (name = 'João') =>
  new Applicant({ id: ApplicantId(randomUUID()), name });

beforeEach(truncateAll);

describe('PrismaApplicantRepository', () => {
  it('saves and retrieves applicant by id', async () => {
    const applicant = makeApplicant();
    await repo.save(applicant);

    const found = await repo.findById(applicant.getId());
    expect(found).not.toBeNull();
    expect(found!.getName()).toBe('João');
  });

  it('returns null for unknown id', async () => {
    const result = await repo.findById(ApplicantId(randomUUID()));
    expect(result).toBeNull();
  });

  it('upsert updates existing applicant', async () => {
    const applicant = makeApplicant('Nome Antigo');
    await repo.save(applicant);
    applicant.changeName('Nome Novo');
    await repo.save(applicant);

    const found = await repo.findById(applicant.getId());
    expect(found!.getName()).toBe('Nome Novo');
  });

  it('findAll returns all applicants ordered by name', async () => {
    await repo.save(makeApplicant('Zebra'));
    await repo.save(makeApplicant('Alpha'));

    const all = await repo.findAll();
    expect(all[0].getName()).toBe('Alpha');
  });

  it('delete removes applicant', async () => {
    const applicant = makeApplicant();
    await repo.save(applicant);
    await repo.delete(applicant.getId());

    const found = await repo.findById(applicant.getId());
    expect(found).toBeNull();
  });
});
