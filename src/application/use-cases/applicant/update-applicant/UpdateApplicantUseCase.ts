import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { ApplicantId } from '../../../../domain/shared/entity-ids';

export interface UpdateApplicantInput {
  id: string;
  name: string;
}

export class UpdateApplicantUseCase {
  constructor(private readonly applicantRepository: IApplicantRepository) {}

  async execute(input: UpdateApplicantInput): Promise<void> {
    const applicant = await this.applicantRepository.findById(ApplicantId(Number(input.id)));
    if (!applicant) {
      throw new Error(`Applicant not found: ${input.id}`);
    }

    applicant.changeName(input.name);

    await this.applicantRepository.save(applicant);
  }
}
