import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { UserId } from '../../../../domain/shared/entity-ids';

export interface UpsertUserFromCognitoInput {
  cognitoSub: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export class UpsertUserFromCognitoUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    input: UpsertUserFromCognitoInput,
  ): Promise<{ id: string; name: string; email: string; imageUrl?: string }> {
    const id = UserId(input.cognitoSub);
    const existing = await this.userRepository.findById(id);

    if (existing) {
      existing.syncProfile(input.name, input.email, input.imageUrl);
      await this.userRepository.save(existing);
      return {
        id: existing.getId(),
        name: existing.getName(),
        email: existing.getEmail(),
        imageUrl: existing.getImageUrl(),
      };
    }

    const user = new User({
      id,
      name: input.name,
      email: input.email,
      imageUrl: input.imageUrl,
    });
    await this.userRepository.save(user);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      imageUrl: user.getImageUrl(),
    };
  }
}
