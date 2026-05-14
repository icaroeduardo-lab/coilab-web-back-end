import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaUserRepository } from '../../infra/db/prisma/repositories/PrismaUserRepository';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users/ListUsersUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    { provide: REPOSITORY_TOKENS.USER, useClass: PrismaUserRepository },
    {
      provide: UpsertUserFromCognitoUseCase,
      useFactory: (repo: IUserRepository) => new UpsertUserFromCognitoUseCase(repo),
      inject: [REPOSITORY_TOKENS.USER],
    },
    {
      provide: ListUsersUseCase,
      useFactory: (repo: IUserRepository) => new ListUsersUseCase(repo),
      inject: [REPOSITORY_TOKENS.USER],
    },
  ],
})
export class UserModule {}
