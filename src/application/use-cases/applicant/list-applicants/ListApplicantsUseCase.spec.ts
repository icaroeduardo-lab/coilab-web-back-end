import { ListApplicantsUseCase } from './ListApplicantsUseCase';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../domain/shared/entity-ids';

let nextId = 1;

const makeRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findByIds: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeApplicant = (name: string) => new Applicant({ id: ApplicantId(nextId++), name });

describe('ListApplicantsUseCase', () => {
  it('returns paginated applicants mapped', async () => {
    const repo = makeRepo();
    const applicants = [makeApplicant('Alice'), makeApplicant('Bob')];
    repo.findAll.mockResolvedValue(applicants);
    repo.count.mockResolvedValue(2);
    const sut = new ListApplicantsUseCase(repo);

    const result = await sut.execute();

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ id: applicants[0].getId(), name: 'Alice' });
    expect(result.data[1]).toEqual({ id: applicants[1].getId(), name: 'Bob' });
  });

  it('returns empty when none exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    repo.count.mockResolvedValue(0);
    const sut = new ListApplicantsUseCase(repo);

    const result = await sut.execute();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
