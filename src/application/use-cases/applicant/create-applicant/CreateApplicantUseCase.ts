import { Applicant } from '../../../../domain/entities/applicant.entity';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { ApplicantId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';
import { ApplicantOutput } from '../shared/applicant-output';

export interface CreateApplicantInput {
  name: string;
}

export class CreateApplicantUseCase {
  constructor(private readonly applicantRepository: IApplicantRepository) {}

  async execute(input: CreateApplicantInput): Promise<ApplicantOutput> {
    const applicant = new Applicant({
      id: ApplicantId(generateId()),
      name: input.name,
    });

    await this.applicantRepository.save(applicant);

    return { id: applicant.getId(), name: applicant.getName() };
  }
}
