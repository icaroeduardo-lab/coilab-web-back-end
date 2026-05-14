import { ListUsersUseCase } from './ListUsersUseCase';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});

const makeUser = (name: string, email: string) =>
  new User({ id: UserId(randomUUID()), name, email });

describe('ListUsersUseCase', () => {
  it('returns all users mapped to output', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([
      makeUser('Alice', 'alice@example.com'),
      makeUser('Bob', 'bob@example.com'),
    ]);
    const sut = new ListUsersUseCase(repo);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[0].email).toBe('alice@example.com');
    expect(result[1].name).toBe('Bob');
  });

  it('returns empty array when no users exist', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([]);
    const sut = new ListUsersUseCase(repo);

    const result = await sut.execute();

    expect(result).toEqual([]);
  });

  it('includes imageUrl when present', async () => {
    const repo = makeRepo();
    repo.findAll.mockResolvedValue([
      new User({ id: UserId(randomUUID()), name: 'Carol', email: 'carol@example.com', imageUrl: 'https://img.example.com/carol.jpg' }),
    ]);
    const sut = new ListUsersUseCase(repo);

    const result = await sut.execute();

    expect(result[0].imageUrl).toBe('https://img.example.com/carol.jpg');
  });
});
