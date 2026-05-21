import { Injectable } from '@nestjs/common';
import { DomainException } from '../../domain/shared/domain.exception';
import {
  CreateGitHubIssueInput,
  CreateGitHubIssueOutput,
  IGitHubService,
  UpdateGitHubIssueInput,
} from '../../domain/repositories/IGitHubService';

@Injectable()
export class GitHubService implements IGitHubService {
  private readonly token = process.env.REPO_TOKEN!;
  private readonly account = process.env.REPO_ACCOUNT!;
  private readonly repoMap = {
    front: process.env.REPO_FRONT!,
    back: process.env.REPO_BACK!,
  };

  async createIssue(input: CreateGitHubIssueInput): Promise<CreateGitHubIssueOutput> {
    const repo = this.repoMap[input.repository];
    const response = await fetch(`https://api.github.com/repos/${this.account}/${repo}/issues`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ title: input.title, body: input.body }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new DomainException(`GitHub API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { html_url: string; number: number };
    return { url: data.html_url, number: data.number };
  }

  async updateIssue(input: UpdateGitHubIssueInput): Promise<void> {
    const repo = this.repoMap[input.repository];
    const payload: Record<string, unknown> = {};
    if (input.title !== undefined) payload.title = input.title;
    if (input.body !== undefined) payload.body = input.body;
    if (input.state !== undefined) payload.state = input.state;
    if (input.stateReason !== undefined) payload.state_reason = input.stateReason;

    const response = await fetch(
      `https://api.github.com/repos/${this.account}/${repo}/issues/${input.issueNumber}`,
      { method: 'PATCH', headers: this.headers(), body: JSON.stringify(payload) },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new DomainException(`GitHub API error ${response.status}: ${text}`);
    }
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    };
  }
}
