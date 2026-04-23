import { randomUUID } from 'crypto';
import { PrismaUserRepository } from '../PrismaUserRepository';
import { User } from '../../../../../domain/entities/user.entity';
import { UserId } from '../../../../../domain/shared/entity-ids';
import { truncateAll } from '../../test/truncate';

const repo = new PrismaUserRepository();

const makeUser = (name = 'Maria', imageUrl?: string) =>
  new User({ id: UserId(randomUUID()), name, imageUrl });

beforeEach(truncateAll);

describe('PrismaUserRepository', () => {
  it('saves and retrieves user by id', async () => {
    const user = makeUser('Maria', 'https://example.com/img.png');
    await repo.save(user);

    const found = await repo.findById(user.getId());
    expect(found).not.toBeNull();
    expect(found!.getName()).toBe('Maria');
    expect(found!.getImageUrl()).toBe('https://example.com/img.png');
  });

  it('returns null for unknown id', async () => {
    const result = await repo.findById(UserId(randomUUID()));
    expect(result).toBeNull();
  });

  it('upsert updates existing user', async () => {
    const user = makeUser('Nome Antigo');
    await repo.save(user);
    user.syncProfile('Nome Novo', 'https://example.com/new.png');
    await repo.save(user);

    const found = await repo.findById(user.getId());
    expect(found!.getName()).toBe('Nome Novo');
    expect(found!.getImageUrl()).toBe('https://example.com/new.png');
  });

  it('saves user without imageUrl', async () => {
    const user = makeUser('Sem Foto');
    await repo.save(user);

    const found = await repo.findById(user.getId());
    expect(found!.getImageUrl()).toBeUndefined();
  });
});
