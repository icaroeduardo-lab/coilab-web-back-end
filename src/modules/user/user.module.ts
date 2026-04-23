import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaUserRepository } from '../../infra/db/prisma/repositories/PrismaUserRepository';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { GetUserUseCase } from '../../application/use-cases/user/get-user/GetUserUseCase';
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
      provide: GetUserUseCase,
      useFactory: (repo: IUserRepository) => new GetUserUseCase(repo),
      inject: [REPOSITORY_TOKENS.USER],
    },
  ],
})
export class UserModule {}
