import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { UserId } from '../../../../domain/shared/entity-ids';

export interface GetUserInput {
  id: string;
}

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserInput): Promise<User> {
    const user = await this.userRepository.findById(UserId(input.id));
    if (!user) {
      throw new Error(`User not found: ${input.id}`);
    }
    return user;
  }
}
