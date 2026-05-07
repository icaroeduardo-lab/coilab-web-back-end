import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { ApplicantId } from '../../../../domain/shared/entity-ids';

export interface DeleteApplicantInput {
  id: string;
}

export class DeleteApplicantUseCase {
  constructor(private readonly applicantRepository: IApplicantRepository) {}

  async execute(input: DeleteApplicantInput): Promise<void> {
    const applicant = await this.applicantRepository.findById(ApplicantId(Number(input.id)));
    if (!applicant) {
      throw new Error(`Applicant not found: ${input.id}`);
    }

    await this.applicantRepository.delete(ApplicantId(Number(input.id)));
  }
}
