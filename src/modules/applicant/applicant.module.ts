import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaApplicantRepository } from '../../infra/db/prisma/repositories/PrismaApplicantRepository';
import { CreateApplicantUseCase } from '../../application/use-cases/applicant/create-applicant/CreateApplicantUseCase';
import { GetApplicantUseCase } from '../../application/use-cases/applicant/get-applicant/GetApplicantUseCase';
import { ListApplicantsUseCase } from '../../application/use-cases/applicant/list-applicants/ListApplicantsUseCase';
import { UpdateApplicantUseCase } from '../../application/use-cases/applicant/update-applicant/UpdateApplicantUseCase';
import { DeleteApplicantUseCase } from '../../application/use-cases/applicant/delete-applicant/DeleteApplicantUseCase';
import { IApplicantRepository } from '../../domain/repositories/IApplicantRepository';
import { ApplicantController } from './applicant.controller';

@Module({
  controllers: [ApplicantController],
  providers: [
    { provide: REPOSITORY_TOKENS.APPLICANT, useClass: PrismaApplicantRepository },
    {
      provide: CreateApplicantUseCase,
      useFactory: (repo: IApplicantRepository) => new CreateApplicantUseCase(repo),
      inject: [REPOSITORY_TOKENS.APPLICANT],
    },
    {
      provide: GetApplicantUseCase,
      useFactory: (repo: IApplicantRepository) => new GetApplicantUseCase(repo),
      inject: [REPOSITORY_TOKENS.APPLICANT],
    },
    {
      provide: ListApplicantsUseCase,
      useFactory: (repo: IApplicantRepository) => new ListApplicantsUseCase(repo),
      inject: [REPOSITORY_TOKENS.APPLICANT],
    },
    {
      provide: UpdateApplicantUseCase,
      useFactory: (repo: IApplicantRepository) => new UpdateApplicantUseCase(repo),
      inject: [REPOSITORY_TOKENS.APPLICANT],
    },
    {
      provide: DeleteApplicantUseCase,
      useFactory: (repo: IApplicantRepository) => new DeleteApplicantUseCase(repo),
      inject: [REPOSITORY_TOKENS.APPLICANT],
    },
  ],
})
export class ApplicantModule {}
