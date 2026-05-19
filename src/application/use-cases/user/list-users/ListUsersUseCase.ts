import { IUserRepository } from '../../../../domain/repositories/IUserRepository';

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserOutput[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => ({
      id: u.getId(),
      name: u.getName(),
      email: u.getEmail(),
      imageUrl: u.getImageUrl(),
    }));
  }
}
