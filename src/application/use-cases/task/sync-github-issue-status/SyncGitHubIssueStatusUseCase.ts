import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { GitHubRepo } from '../../../../domain/repositories/IGitHubService';
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';

export interface SyncGitHubIssueStatusInput {
  issueNumber: number;
  repository: GitHubRepo;
  action: 'opened' | 'closed' | 'reopened';
}

export class SyncGitHubIssueStatusUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: SyncGitHubIssueStatusInput): Promise<void> {
    const task = await this.taskRepository.findByGitHubIssueNumber(
      input.issueNumber,
      input.repository,
    );
    if (!task) return;

    const closed = input.action === 'closed';
    let changed = false;

    for (const subTask of task.getSubTasks()) {
      const issues = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];
      const index = issues.findIndex(
        (i) => i.githubNumber === input.issueNumber && i.repository === input.repository,
      );
      if (index === -1) continue;

      const issue = issues[index];
      const updated: DevelopmentIssue = {
        ...issue,
        status: closed,
        completionDate: closed ? new Date().toISOString() : undefined,
        closeReason: closed ? 'completed' : undefined,
      };

      const updatedIssues = [...issues];
      updatedIssues[index] = updated;
      subTask.updateMetadata({ issues: updatedIssues });
      changed = true;
      break;
    }

    if (changed) await this.taskRepository.save(task);
  }
}
