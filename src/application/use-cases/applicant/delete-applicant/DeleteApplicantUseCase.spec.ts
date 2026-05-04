import { DeleteApplicantUseCase } from './DeleteApplicantUseCase';
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

const makeApplicant = (id: number) => new Applicant({ id: ApplicantId(id), name: 'John Doe' });

describe('DeleteApplicantUseCase', () => {
  it('deletes applicant by id', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(makeApplicant(1));
    const sut = new DeleteApplicantUseCase(repo);

    await sut.execute({ id: '1' });

    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new DeleteApplicantUseCase(repo);

    await expect(sut.execute({ id: '999' })).rejects.toThrow('Applicant not found');
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
