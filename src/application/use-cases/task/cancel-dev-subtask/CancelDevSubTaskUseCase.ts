import { IGitHubService } from '../../../../domain/repositories/IGitHubService';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { DomainException } from '../../../../domain/shared/domain.exception';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { COILAB_WEB_PROJECT_ID } from '../../../../domain/shared/project-constants';
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';

export interface CancelDevSubTaskInput {
  taskId: string;
  subTaskId: string;
  reason: string;
}

export class CancelDevSubTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly gitHubService: IGitHubService,
  ) {}

  async execute(input: CancelDevSubTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);
    if (subTask.getTypeId() !== 4)
      throw new DomainException('SubTask não é do tipo Desenvolvimento');

    const isCoilabWeb = task.getProjectId() === COILAB_WEB_PROJECT_ID;
    const issues = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];

    const completionDate = new Date().toISOString();

    const updatedIssues = await Promise.all(
      issues.map(async (issue) => {
        if (issue.status) return issue;

        if (isCoilabWeb && issue.githubNumber && issue.repository) {
          await this.gitHubService.updateIssue({
            repository: issue.repository,
            issueNumber: issue.githubNumber,
            state: 'closed',
          });
        }

        return { ...issue, status: true, completionDate };
      }),
    );

    subTask.cancelWithMetadata(input.reason, { issues: updatedIssues });

    await this.taskRepository.save(task);
  }
}
