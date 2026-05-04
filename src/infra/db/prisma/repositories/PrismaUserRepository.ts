import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/shared/entity-ids';
import { prisma } from '../prisma.client';
import type { User as PrismaUser } from '../../../../generated/prisma/client';

function toDomain(row: PrismaUser): User {
  return new User({
    id: UserId(row.id),
    name: row.name,
    email: '',
    imageUrl: row.imageUrl ?? undefined,
  });
}

export class PrismaUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.getId() },
      create: {
        id: user.getId(),
        name: user.getName(),
        imageUrl: user.getImageUrl(),
      },
      update: {
        name: user.getName(),
        imageUrl: user.getImageUrl(),
      },
    });
  }
}
