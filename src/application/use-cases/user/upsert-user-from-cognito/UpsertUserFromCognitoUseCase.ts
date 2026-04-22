import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { UserId } from '../../../../domain/shared/entity-ids';

export interface UpsertUserFromCognitoInput {
  cognitoSub: string;
  name: string;
  imageUrl?: string;
}

export class UpsertUserFromCognitoUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpsertUserFromCognitoInput): Promise<void> {
    const id = UserId(input.cognitoSub);
    const existing = await this.userRepository.findById(id);

    if (existing) {
      existing.syncProfile(input.name, input.imageUrl);
      await this.userRepository.save(existing);
      return;
    }

    const user = new User({ id, name: input.name, imageUrl: input.imageUrl });
    await this.userRepository.save(user);
  }
}
