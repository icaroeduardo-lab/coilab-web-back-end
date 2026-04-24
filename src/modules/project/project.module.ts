import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaProjectRepository } from '../../infra/db/prisma/repositories/PrismaProjectRepository';
import { CreateProjectUseCase } from '../../application/use-cases/project/create-project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../application/use-cases/project/get-project/GetProjectUseCase';
import { ListProjectsUseCase } from '../../application/use-cases/project/list-projects/ListProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/project/update-project/UpdateProjectUseCase';
import { ChangeProjectStatusUseCase } from '../../application/use-cases/project/change-project-status/ChangeProjectStatusUseCase';
import { GetDocumentUploadUrlUseCase } from '../../application/use-cases/project/get-document-upload-url/GetDocumentUploadUrlUseCase';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { S3StorageService } from '../../infra/storage/S3StorageService';
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
    S3StorageService,
    {
      provide: GetDocumentUploadUrlUseCase,
      useFactory: (repo: IProjectRepository, storage: S3StorageService) =>
        new GetDocumentUploadUrlUseCase(repo, storage),
      inject: [REPOSITORY_TOKENS.PROJECT, S3StorageService],
    },
  ],
})
export class ProjectModule {}
