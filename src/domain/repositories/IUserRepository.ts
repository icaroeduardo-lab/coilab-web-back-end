import { ApplicantId } from '../shared/entity-ids';

export interface UserData {
  id: string;
  name: string;
}

export interface IUserRepository {
  findById(id: ApplicantId): Promise<UserData | null>;
}
