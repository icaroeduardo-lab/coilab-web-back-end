import { Applicant } from '../entities/applicant.entity';
import { ApplicantId } from '../shared/entity-ids';

export interface IApplicantRepository {
  findById(id: ApplicantId): Promise<Applicant | null>;
  save(applicant: Applicant): Promise<void>;
}
