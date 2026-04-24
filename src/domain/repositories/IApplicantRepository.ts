import { Applicant } from '../entities/applicant.entity';
import { ApplicantId } from '../shared/entity-ids';

export interface IApplicantRepository {
  findById(id: ApplicantId): Promise<Applicant | null>;
  findByIds(ids: ApplicantId[]): Promise<Applicant[]>;
  findAll(): Promise<Applicant[]>;
  count(): Promise<number>;
  save(applicant: Applicant): Promise<void>;
  delete(id: ApplicantId): Promise<void>;
}
