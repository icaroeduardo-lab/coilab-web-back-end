import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { WebhookController } from './webhook.controller';
import { SyncGitHubIssueStatusUseCase } from '../../application/use-cases/task/sync-github-issue-status/SyncGitHubIssueStatusUseCase';

const SECRET = 'test-secret';

const makeSyncUseCase = (): jest.Mocked<SyncGitHubIssueStatusUseCase> =>
  ({
    execute: jest.fn().mockResolvedValue(undefined),
  }) as unknown as jest.Mocked<SyncGitHubIssueStatusUseCase>;

function sign(secret: string, body: Buffer): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

function makeController(syncUseCase: SyncGitHubIssueStatusUseCase) {
  const ctrl = new WebhookController(syncUseCase);
  const c = ctrl as unknown as Record<string, unknown>;
  c['secret'] = SECRET;
  c['repoMap'] = { 'coilab-web': 'front', 'coilab-web-back-end': 'back' };
  return ctrl;
}

const makePayload = (action: string, number = 1, repoName = 'coilab-web') => ({
  action,
  issue: { number },
  repository: { name: repoName },
});

describe('WebhookController', () => {
  describe('signature validation', () => {
    it('accepts valid signature', async () => {
      const sync = makeSyncUseCase();
      const ctrl = makeController(sync);
      const payload = makePayload('closed');
      const body = Buffer.from(JSON.stringify(payload));
      const sig = sign(SECRET, body);

      const result = await ctrl.handleGitHub({ rawBody: body } as never, sig, 'issues', payload);

      expect(result).toEqual({ ok: true });
    });

    it('rejects invalid signature', async () => {
      const ctrl = makeController(makeSyncUseCase());
      const body = Buffer.from('{}');

      await expect(
        ctrl.handleGitHub(
          { rawBody: body } as never,
          'sha256=invalid',
          'issues',
          makePayload('closed'),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects missing signature', async () => {
      const ctrl = makeController(makeSyncUseCase());
      const body = Buffer.from('{}');

      await expect(
        ctrl.handleGitHub({ rawBody: body } as never, '', 'issues', makePayload('closed')),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('event filtering', () => {
    it('ignores non-issues events', async () => {
      const sync = makeSyncUseCase();
      const ctrl = makeController(sync);
      const payload = makePayload('closed');
      const body = Buffer.from(JSON.stringify(payload));

      const result = await ctrl.handleGitHub(
        { rawBody: body } as never,
        sign(SECRET, body),
        'push',
        payload,
      );

      expect(result).toEqual({ ignored: true });
      expect(sync.execute).not.toHaveBeenCalled();
    });

    it('ignores unknown actions', async () => {
      const sync = makeSyncUseCase();
      const ctrl = makeController(sync);
      const payload = makePayload('labeled');
      const body = Buffer.from(JSON.stringify(payload));

      const result = await ctrl.handleGitHub(
        { rawBody: body } as never,
        sign(SECRET, body),
        'issues',
        payload,
      );

      expect(result).toEqual({ ignored: true });
      expect(sync.execute).not.toHaveBeenCalled();
    });

    it('ignores unknown repositories', async () => {
      const sync = makeSyncUseCase();
      const ctrl = makeController(sync);
      const payload = makePayload('closed', 1, 'unknown-repo');
      const body = Buffer.from(JSON.stringify(payload));

      const result = await ctrl.handleGitHub(
        { rawBody: body } as never,
        sign(SECRET, body),
        'issues',
        payload,
      );

      expect(result).toEqual({ ignored: true });
      expect(sync.execute).not.toHaveBeenCalled();
    });
  });

  it('calls syncIssue for closed action', async () => {
    const sync = makeSyncUseCase();
    const ctrl = makeController(sync);
    const payload = makePayload('closed', 42, 'coilab-web');
    const body = Buffer.from(JSON.stringify(payload));

    await ctrl.handleGitHub({ rawBody: body } as never, sign(SECRET, body), 'issues', payload);

    expect(sync.execute).toHaveBeenCalledWith(
      expect.objectContaining({ issueNumber: 42, action: 'closed' }),
    );
  });
});
