import { Injectable } from '@nestjs/common';
import { DomainException } from '../../domain/shared/domain.exception';
import {
  CreateGitHubIssueInput,
  CreateGitHubIssueOutput,
  IGitHubService,
} from '../../domain/repositories/IGitHubService';

@Injectable()
export class GitHubService implements IGitHubService {
  private readonly token = process.env.GITHUB_TOKEN!;
  private readonly account = process.env.GITHUB_ACCOUNT!;
  private readonly repoMap = {
    front: process.env.GITHUB_REPO_FRONT!,
    back: process.env.GITHUB_REPO_BACK!,
  };

  async createIssue(input: CreateGitHubIssueInput): Promise<CreateGitHubIssueOutput> {
    const repo = this.repoMap[input.repository];
    const response = await fetch(`https://api.github.com/repos/${this.account}/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: input.title, body: input.body }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new DomainException(`GitHub API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { html_url: string; number: number };
    return { url: data.html_url, number: data.number };
  }
}
