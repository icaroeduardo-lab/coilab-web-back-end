import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { createHmac, timingSafeEqual } from 'crypto';
import { FastifyRequest } from 'fastify';
import { Public } from '../auth/public.decorator';
import { SyncGitHubIssueStatusUseCase } from '../../application/use-cases/task/sync-github-issue-status/SyncGitHubIssueStatusUseCase';
import { GitHubRepo } from '../../domain/repositories/IGitHubService';

interface GitHubIssuePayload {
  action: string;
  issue: { number: number };
  repository: { name: string };
}

const REPO_MAP: Record<string, GitHubRepo> = {
  [process.env.GITHUB_REPO_FRONT ?? '']: 'front',
  [process.env.GITHUB_REPO_BACK ?? '']: 'back',
};

@ApiExcludeController()
@Public()
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly secret = process.env.GITHUB_WEBHOOK_SECRET ?? '';

  constructor(
    @Inject(SyncGitHubIssueStatusUseCase)
    private readonly syncIssue: SyncGitHubIssueStatusUseCase,
  ) {}

  @Post('github')
  @HttpCode(200)
  async handleGitHub(
    @Req() req: FastifyRequest & { rawBody?: Buffer },
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
    @Body() payload: GitHubIssuePayload,
  ) {
    this.verifySignature(req.rawBody, signature);

    if (event !== 'issues') return { ignored: true };

    const action = payload.action;
    if (!['opened', 'closed', 'reopened'].includes(action)) return { ignored: true };

    const repoName = payload.repository.name;
    const repository = REPO_MAP[repoName];
    if (!repository) {
      this.logger.warn(`Webhook from unknown repo: ${repoName}`);
      return { ignored: true };
    }

    await this.syncIssue.execute({
      issueNumber: payload.issue.number,
      repository,
      action: action as 'opened' | 'closed' | 'reopened',
    });

    return { ok: true };
  }

  private verifySignature(rawBody: Buffer | undefined, signature: string): void {
    if (!this.secret) return;
    if (!signature || !rawBody) throw new UnauthorizedException('Missing signature');

    const expected = `sha256=${createHmac('sha256', this.secret).update(rawBody).digest('hex')}`;
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
