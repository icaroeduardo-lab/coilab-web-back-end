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

export interface UpdateGitHubIssueStateInput {
  repository: GitHubRepo;
  issueNumber: number;
  state: GitHubIssueState;
}

export interface IGitHubService {
  createIssue(input: CreateGitHubIssueInput): Promise<CreateGitHubIssueOutput>;
  updateIssueState(input: UpdateGitHubIssueStateInput): Promise<void>;
}
