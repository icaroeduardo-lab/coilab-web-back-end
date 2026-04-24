import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import {
  PaginationInput,
  PaginatedOutput,
  toPagination,
} from '../../../../domain/shared/pagination';
import { ApplicantOutput } from '../shared/applicant-output';

export class ListApplicantsUseCase {
  constructor(private readonly applicantRepository: IApplicantRepository) {}

  async execute(input?: Partial<PaginationInput>): Promise<PaginatedOutput<ApplicantOutput>> {
    const { page, limit } = toPagination(input?.page, input?.limit);

    const [applicants, total] = await Promise.all([
      this.applicantRepository.findAll(),
      this.applicantRepository.count(),
    ]);

    const sliced = applicants.slice((page - 1) * limit, page * limit);
    const data = sliced.map((a) => ({ id: a.getId(), name: a.getName() }));

    return { data, total, page, limit };
  }
}
