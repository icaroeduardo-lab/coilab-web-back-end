import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaTaskRepository } from '../../infra/db/prisma/repositories/PrismaTaskRepository';
import { PrismaProjectRepository } from '../../infra/db/prisma/repositories/PrismaProjectRepository';
import { PrismaApplicantRepository } from '../../infra/db/prisma/repositories/PrismaApplicantRepository';
import { PrismaUserRepository } from '../../infra/db/prisma/repositories/PrismaUserRepository';
import { PrismaFlowRepository } from '../../infra/db/prisma/repositories/PrismaFlowRepository';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IApplicantRepository } from '../../domain/repositories/IApplicantRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IFlowRepository } from '../../domain/repositories/IFlowRepository';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task/CreateTaskUseCase';
import { GetTaskUseCase } from '../../application/use-cases/task/get-task/GetTaskUseCase';
import { ListAllTasksUseCase } from '../../application/use-cases/task/list-all-tasks/ListAllTasksUseCase';
import { ListTasksByProjectUseCase } from '../../application/use-cases/task/list-tasks-by-project/ListTasksByProjectUseCase';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task/UpdateTaskUseCase';
import { ChangeTaskStatusUseCase } from '../../application/use-cases/task/change-task-status/ChangeTaskStatusUseCase';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task/DeleteTaskUseCase';
import { AddSubTaskToTaskUseCase } from '../../application/use-cases/task/add-subtask-to-task/AddSubTaskToTaskUseCase';
import { ChangeSubTaskStatusUseCase } from '../../application/use-cases/task/change-subtask-status/ChangeSubTaskStatusUseCase';
import { UpdateDiscoveryFormUseCase } from '../../application/use-cases/task/update-discovery-form/UpdateDiscoveryFormUseCase';
import { AddDesignToSubTaskUseCase } from '../../application/use-cases/task/add-design-to-subtask/AddDesignToSubTaskUseCase';
import { RemoveDesignFromSubTaskUseCase } from '../../application/use-cases/task/remove-design-from-subtask/RemoveDesignFromSubTaskUseCase';
import { GetDesignUploadUrlUseCase } from '../../application/use-cases/task/get-design-upload-url/GetDesignUploadUrlUseCase';
import { S3StorageService } from '../../infra/storage/S3StorageService';
import { TaskController } from './task.controller';

@Module({
  controllers: [TaskController],
  providers: [
    { provide: REPOSITORY_TOKENS.TASK, useClass: PrismaTaskRepository },
    { provide: REPOSITORY_TOKENS.PROJECT, useClass: PrismaProjectRepository },
    { provide: REPOSITORY_TOKENS.APPLICANT, useClass: PrismaApplicantRepository },
    { provide: REPOSITORY_TOKENS.USER, useClass: PrismaUserRepository },
    { provide: REPOSITORY_TOKENS.FLOW, useClass: PrismaFlowRepository },
    {
      provide: CreateTaskUseCase,
      useFactory: (repo: ITaskRepository) => new CreateTaskUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: GetTaskUseCase,
      useFactory: (
        task: ITaskRepository,
        user: IUserRepository,
        applicant: IApplicantRepository,
        flow: IFlowRepository,
        project: IProjectRepository,
      ) => new GetTaskUseCase(task, user, applicant, flow, project),
      inject: [
        REPOSITORY_TOKENS.TASK,
        REPOSITORY_TOKENS.USER,
        REPOSITORY_TOKENS.APPLICANT,
        REPOSITORY_TOKENS.FLOW,
        REPOSITORY_TOKENS.PROJECT,
      ],
    },
    {
      provide: ListAllTasksUseCase,
      useFactory: (
        task: ITaskRepository,
        applicant: IApplicantRepository,
        project: IProjectRepository,
      ) => new ListAllTasksUseCase(task, applicant, project),
      inject: [REPOSITORY_TOKENS.TASK, REPOSITORY_TOKENS.APPLICANT, REPOSITORY_TOKENS.PROJECT],
    },
    {
      provide: ListTasksByProjectUseCase,
      useFactory: (repo: ITaskRepository) => new ListTasksByProjectUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: UpdateTaskUseCase,
      useFactory: (repo: ITaskRepository) => new UpdateTaskUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: ChangeTaskStatusUseCase,
      useFactory: (repo: ITaskRepository) => new ChangeTaskStatusUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: DeleteTaskUseCase,
      useFactory: (repo: ITaskRepository) => new DeleteTaskUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: AddSubTaskToTaskUseCase,
      useFactory: (repo: ITaskRepository) => new AddSubTaskToTaskUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: ChangeSubTaskStatusUseCase,
      useFactory: (repo: ITaskRepository) => new ChangeSubTaskStatusUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: UpdateDiscoveryFormUseCase,
      useFactory: (repo: ITaskRepository) => new UpdateDiscoveryFormUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: AddDesignToSubTaskUseCase,
      useFactory: (repo: ITaskRepository) => new AddDesignToSubTaskUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    {
      provide: RemoveDesignFromSubTaskUseCase,
      useFactory: (repo: ITaskRepository) => new RemoveDesignFromSubTaskUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
    S3StorageService,
    {
      provide: GetDesignUploadUrlUseCase,
      useFactory: (repo: ITaskRepository, storage: S3StorageService) =>
        new GetDesignUploadUrlUseCase(repo, storage),
      inject: [REPOSITORY_TOKENS.TASK, S3StorageService],
    },
  ],
})
export class TaskModule {}
