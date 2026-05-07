import { CreateApplicantUseCase } from './CreateApplicantUseCase';
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

describe('CreateApplicantUseCase', () => {
  it('creates and saves applicant', async () => {
    const repo = makeRepo();
    const saved = new Applicant({ id: ApplicantId(7), name: 'John Doe' });
    repo.save.mockResolvedValue(saved);
    const sut = new CreateApplicantUseCase(repo);

    const output = await sut.execute({ name: 'John Doe' });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(output.name).toBe('John Doe');
    expect(output.id).toBe(7);
  });

  it('throws when name is empty', async () => {
    const repo = makeRepo();
    const sut = new CreateApplicantUseCase(repo);

    await expect(sut.execute({ name: '' })).rejects.toThrow();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
