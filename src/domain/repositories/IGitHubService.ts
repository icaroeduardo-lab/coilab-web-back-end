export type GitHubRepo = 'front' | 'back';
export type GitHubIssueState = 'open' | 'closed';

export interface CreateGitHubIssueInput {
  repository: GitHubRepo;
  title: string;
  body?: string;
}

export interface CreateGitHubIssueOutput {
  url: string;
  number: number;
}

export interface UpdateGitHubIssueInput {
  repository: GitHubRepo;
  issueNumber: number;
  title?: string;
  body?: string;
  state?: GitHubIssueState;
}

export interface IGitHubService {
  createIssue(input: CreateGitHubIssueInput): Promise<CreateGitHubIssueOutput>;
  updateIssue(input: UpdateGitHubIssueInput): Promise<void>;
}
