import { GetApplicantUseCase } from './GetApplicantUseCase';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../domain/shared/entity-ids';

const makeRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByIds: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeApplicant = (id: number, name = 'John Doe') =>
  new Applicant({ id: ApplicantId(id), name });

describe('GetApplicantUseCase', () => {
  it('returns applicant output', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(makeApplicant(1));
    const sut = new GetApplicantUseCase(repo);

    const result = await sut.execute({ id: '1' });

    expect(result).toEqual({ id: 1, name: 'John Doe' });
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new GetApplicantUseCase(repo);

    await expect(sut.execute({ id: '999' })).rejects.toThrow('Applicant not found');
  });
});
