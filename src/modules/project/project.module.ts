import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaProjectRepository } from '../../infra/db/prisma/repositories/PrismaProjectRepository';
import { CreateProjectUseCase } from '../../application/use-cases/project/create-project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../application/use-cases/project/get-project/GetProjectUseCase';
import { ListProjectsUseCase } from '../../application/use-cases/project/list-projects/ListProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/project/update-project/UpdateProjectUseCase';
import { ChangeProjectStatusUseCase } from '../../application/use-cases/project/change-project-status/ChangeProjectStatusUseCase';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { ProjectController } from './project.controller';

@Module({
  controllers: [ProjectController],
  providers: [
    { provide: REPOSITORY_TOKENS.PROJECT, useClass: PrismaProjectRepository },
    {
      provide: CreateProjectUseCase,
      useFactory: (repo: IProjectRepository) => new CreateProjectUseCase(repo),
      inject: [REPOSITORY_TOKENS.PROJECT],
    },
    {
      provide: GetProjectUseCase,
      useFactory: (repo: IProjectRepository) => new GetProjectUseCase(repo),
      inject: [REPOSITORY_TOKENS.PROJECT],
    },
    {
      provide: ListProjectsUseCase,
      useFactory: (repo: IProjectRepository) => new ListProjectsUseCase(repo),
      inject: [REPOSITORY_TOKENS.PROJECT],
    },
    {
      provide: UpdateProjectUseCase,
      useFactory: (repo: IProjectRepository) => new UpdateProjectUseCase(repo),
      inject: [REPOSITORY_TOKENS.PROJECT],
    },
    {
      provide: ChangeProjectStatusUseCase,
      useFactory: (repo: IProjectRepository) => new ChangeProjectStatusUseCase(repo),
      inject: [REPOSITORY_TOKENS.PROJECT],
    },
  ],
})
export class ProjectModule {}
