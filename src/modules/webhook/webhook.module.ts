import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { SyncGitHubIssueStatusUseCase } from '../../application/use-cases/task/sync-github-issue-status/SyncGitHubIssueStatusUseCase';
import { PrismaTaskRepository } from '../../infra/db/prisma/repositories/PrismaTaskRepository';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';

@Module({
  controllers: [WebhookController],
  providers: [
    { provide: REPOSITORY_TOKENS.TASK, useClass: PrismaTaskRepository },
    {
      provide: SyncGitHubIssueStatusUseCase,
      useFactory: (repo: PrismaTaskRepository) => new SyncGitHubIssueStatusUseCase(repo),
      inject: [REPOSITORY_TOKENS.TASK],
    },
  ],
})
export class WebhookModule {}
