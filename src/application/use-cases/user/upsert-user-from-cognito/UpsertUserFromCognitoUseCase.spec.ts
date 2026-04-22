import { UpsertUserFromCognitoUseCase } from './UpsertUserFromCognitoUseCase';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/shared/entity-ids';
import { randomUUID } from 'crypto';

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  save: jest.fn(),
});

const makeUser = (id: string) =>
  new User({ id: UserId(id), name: 'Old Name', imageUrl: 'https://old.img' });

describe('UpsertUserFromCognitoUseCase', () => {
  it('creates user when not found', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const sut = new UpsertUserFromCognitoUseCase(repo);
    const cognitoSub = randomUUID();

    await sut.execute({ cognitoSub, name: 'John Doe', imageUrl: 'https://img.example.com' });

    const saved: User = repo.save.mock.calls[0][0];
    expect(saved.getId()).toBe(cognitoSub);
    expect(saved.getName()).toBe('John Doe');
    expect(saved.getImageUrl()).toBe('https://img.example.com');
  });

  it('syncs profile when user already exists', async () => {
    const repo = makeRepo();
    const cognitoSub = randomUUID();
    repo.findById.mockResolvedValue(makeUser(cognitoSub));
    const sut = new UpsertUserFromCognitoUseCase(repo);

    await sut.execute({ cognitoSub, name: 'New Name', imageUrl: 'https://new.img' });

    const saved: User = repo.save.mock.calls[0][0];
    expect(saved.getName()).toBe('New Name');
    expect(saved.getImageUrl()).toBe('https://new.img');
  });

  it('syncs profile without imageUrl', async () => {
    const repo = makeRepo();
    const cognitoSub = randomUUID();
    repo.findById.mockResolvedValue(makeUser(cognitoSub));
    const sut = new UpsertUserFromCognitoUseCase(repo);

    await sut.execute({ cognitoSub, name: 'New Name' });

    const saved: User = repo.save.mock.calls[0][0];
    expect(saved.getImageUrl()).toBeUndefined();
  });
});
