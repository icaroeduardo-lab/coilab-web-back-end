import { PrismaApplicantRepository } from '../PrismaApplicantRepository';
import { Applicant } from '../../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const repo = new PrismaApplicantRepository();

const makeApplicant = (name = 'João') => new Applicant({ id: ApplicantId(0), name });

beforeEach(truncateAll);

describe('PrismaApplicantRepository', () => {
  it('saves and retrieves applicant by id', async () => {
    const saved = await repo.save(makeApplicant());

    const found = await repo.findById(saved.getId());
    expect(found).not.toBeNull();
    expect(found!.getName()).toBe('João');
  });

  it('returns null for unknown id', async () => {
    const result = await repo.findById(ApplicantId(99999));
    expect(result).toBeNull();
  });

  it('update updates existing applicant', async () => {
    const saved = await repo.save(makeApplicant('Nome Antigo'));
    const existing = new Applicant({ id: saved.getId(), name: 'Nome Novo' });
    await repo.save(existing);

    const found = await repo.findById(saved.getId());
    expect(found!.getName()).toBe('Nome Novo');
  });

  it('findAll returns all applicants ordered by name', async () => {
    await repo.save(makeApplicant('Zebra'));
    await repo.save(makeApplicant('Alpha'));

    const all = await repo.findAll();
    expect(all[0].getName()).toBe('Alpha');
  });

  it('delete removes applicant', async () => {
    const saved = await repo.save(makeApplicant());
    await repo.delete(saved.getId());

    const found = await repo.findById(saved.getId());
    expect(found).toBeNull();
  });
});
