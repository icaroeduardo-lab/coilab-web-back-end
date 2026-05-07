import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { ApplicantId } from '../../../../domain/shared/entity-ids';
import { ApplicantOutput } from '../shared/applicant-output';

export interface GetApplicantInput {
  id: string;
}

export class GetApplicantUseCase {
  constructor(private readonly applicantRepository: IApplicantRepository) {}

  async execute(input: GetApplicantInput): Promise<ApplicantOutput> {
    const applicant = await this.applicantRepository.findById(ApplicantId(Number(input.id)));
    if (!applicant) {
      throw new Error(`Applicant not found: ${input.id}`);
    }

    return { id: applicant.getId(), name: applicant.getName() };
  }
}
