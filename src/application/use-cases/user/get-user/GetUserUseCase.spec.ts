import { GetUserUseCase } from './GetUserUseCase';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});

describe('GetUserUseCase', () => {
  it('returns user by id', async () => {
    const repo = makeRepo();
    const id = randomUUID();
    repo.findById.mockResolvedValue(
      new User({ id: UserId(id), name: 'John', email: 'john@example.com' }),
    );
    const sut = new GetUserUseCase(repo);

    const result = await sut.execute({ id });

    expect(result.getId()).toBe(id);
    expect(result.getName()).toBe('John');
    expect(result.getEmail()).toBe('john@example.com');
  });

  it('throws when user not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new GetUserUseCase(repo);

    await expect(sut.execute({ id: randomUUID() })).rejects.toThrow('User not found');
  });
});
