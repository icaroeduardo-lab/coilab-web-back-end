import { User } from '../entities/user.entity';
import { UserId } from '../shared/entity-ids';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
}
