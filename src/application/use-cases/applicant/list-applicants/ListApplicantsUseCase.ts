import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { ApplicantOutput } from '../shared/applicant-output';

export class ListApplicantsUseCase {
  constructor(private readonly applicantRepository: IApplicantRepository) {}

  async execute(): Promise<ApplicantOutput[]> {
    const applicants = await this.applicantRepository.findAll();
    return applicants.map((a) => ({ id: a.getId(), name: a.getName() }));
  }
}
