import { UpdateApplicantUseCase } from './UpdateApplicantUseCase';
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

const makeApplicant = (id: number) => new Applicant({ id: ApplicantId(id), name: 'Old Name' });

describe('UpdateApplicantUseCase', () => {
  it('updates applicant name', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(makeApplicant(1));
    repo.save.mockImplementation(async (a) => a);
    const sut = new UpdateApplicantUseCase(repo);

    await sut.execute({ id: '1', name: 'New Name' });

    const saved: Applicant = repo.save.mock.calls[0][0];
    expect(saved.getName()).toBe('New Name');
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new UpdateApplicantUseCase(repo);

    await expect(sut.execute({ id: '999', name: 'X' })).rejects.toThrow('Applicant not found');
  });

  it('throws when name is empty', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(makeApplicant(1));
    const sut = new UpdateApplicantUseCase(repo);

    await expect(sut.execute({ id: '1', name: '' })).rejects.toThrow();
  });
});
