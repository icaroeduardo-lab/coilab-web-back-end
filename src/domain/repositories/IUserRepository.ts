import { User } from '../entities/user.entity';
import { UserId } from '../shared/entity-ids';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
