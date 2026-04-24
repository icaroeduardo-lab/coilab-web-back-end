import { DeleteApplicantUseCase } from './DeleteApplicantUseCase';
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

const makeApplicant = (id: string) => new Applicant({ id: ApplicantId(id), name: 'John Doe' });

describe('DeleteApplicantUseCase', () => {
  it('deletes applicant by id', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(makeApplicant(id));
    const sut = new DeleteApplicantUseCase(repo);

    await sut.execute({ id });

    expect(repo.delete).toHaveBeenCalledWith(id);
  });

  it('throws when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new DeleteApplicantUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('Applicant not found');
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
