import { ListApplicantsUseCase } from './ListApplicantsUseCase';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeApplicant = (name: string) =>
  new Applicant({ id: ApplicantId(randomUUID()), name });

describe('ListApplicantsUseCase', () => {
  it('returns all applicants mapped', async () => {
    const repo = makeRepo();
    const applicants = [makeApplicant('Alice'), makeApplicant('Bob')];
    repo.findAll.mockResolvedValue(applicants);
    const sut = new ListApplicantsUseCase(repo);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: applicants[0].getId(), name: 'Alice' });
    expect(result[1]).toEqual({ id: applicants[1].getId(), name: 'Bob' });
  });

  it('returns empty array when none exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    const sut = new ListApplicantsUseCase(repo);

    expect(await sut.execute()).toEqual([]);
  });
});
