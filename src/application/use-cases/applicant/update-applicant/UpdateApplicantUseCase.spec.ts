import { UpdateApplicantUseCase } from './UpdateApplicantUseCase';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { Applicant } from '../../../../domain/entities/applicant.entity';
import { ApplicantId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IApplicantRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByIds: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const makeApplicant = (id: string) => new Applicant({ id: ApplicantId(id), name: 'Old Name' });

describe('UpdateApplicantUseCase', () => {
  it('updates applicant name', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeApplicant(id));
    const sut = new UpdateApplicantUseCase(repo);

    await sut.execute({ id, name: 'New Name' });

    const saved: Applicant = repo.save.mock.calls[0][0];
    expect(saved.getName()).toBe('New Name');
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new UpdateApplicantUseCase(repo);

    await expect(sut.execute({ id: randomUUID(), name: 'X' })).rejects.toThrow(
      'Applicant not found',
    );
  });

  it('throws when name is empty', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeApplicant(id));
    const sut = new UpdateApplicantUseCase(repo);

    await expect(sut.execute({ id, name: '' })).rejects.toThrow();
  });
});
