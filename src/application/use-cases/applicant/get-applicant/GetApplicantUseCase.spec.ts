import { GetApplicantUseCase } from './GetApplicantUseCase';
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

const makeApplicant = (id: string, name = 'John Doe') =>
  new Applicant({ id: ApplicantId(id), name });

describe('GetApplicantUseCase', () => {
  it('returns applicant output', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeApplicant(id));
    const sut = new GetApplicantUseCase(repo);

    const result = await sut.execute({ id });

    expect(result).toEqual({ id, name: 'John Doe' });
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new GetApplicantUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Applicant not found');
  });
});
