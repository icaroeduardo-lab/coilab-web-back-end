export type GitHubRepo = 'front' | 'back';

export interface CreateGitHubIssueInput {
  repository: GitHubRepo;
  title: string;
  body?: string;
}

export interface CreateGitHubIssueOutput {
  url: string;
  number: number;
}

export interface IGitHubService {
  createIssue(input: CreateGitHubIssueInput): Promise<CreateGitHubIssueOutput>;
}
