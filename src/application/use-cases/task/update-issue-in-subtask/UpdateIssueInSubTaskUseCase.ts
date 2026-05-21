import { GitHubIssueState, IGitHubService } from '../../../../domain/repositories/IGitHubService';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { DomainException } from '../../../../domain/shared/domain.exception';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { COILAB_WEB_PROJECT_ID } from '../../../../domain/shared/project-constants';
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';

export interface UpdateIssueInSubTaskInput {
  taskId: string;
  subTaskId: string;
  issueId: string;
  title?: string;
  body?: string;
  flowId?: number;
  sprint?: string;
  status?: boolean;
}

export class UpdateIssueInSubTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly gitHubService: IGitHubService,
  ) {}

  async execute(input: UpdateIssueInSubTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);
    if (subTask.getTypeId() !== 4)
      throw new DomainException('SubTask não é do tipo Desenvolvimento');

    const issues = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];
    const index = issues.findIndex((i) => i.id === input.issueId);
    if (index === -1) throw new DomainException(`Issue não encontrada: ${input.issueId}`);

    const issue = issues[index];

    if (issue.status === true) {
      throw new DomainException('Issue concluída não pode ser editada');
    }

    const isCoilabWeb = task.getProjectId() === COILAB_WEB_PROJECT_ID;

    if (!isCoilabWeb && input.status === true) {
      const effectiveSprint = input.sprint ?? issue.sprint;
      if (!effectiveSprint) {
        throw new DomainException('Para concluir uma issue é necessário informar sprint');
      }
    }

    const closing = input.status === true;
    const reopening = input.status === false;

    const updated: DevelopmentIssue = {
      ...issue,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(!isCoilabWeb && input.flowId !== undefined && { flowId: input.flowId }),
      ...(input.sprint !== undefined && { sprint: input.sprint }),
      ...(input.status !== undefined && { status: input.status }),
      ...(closing && {
        completionDate: new Date().toISOString(),
        closeReason: 'completed' as const,
      }),
      ...(reopening && { completionDate: undefined, closeReason: undefined }),
    };

    if (isCoilabWeb && issue.githubNumber && issue.repository) {
      const hasGitHubChanges =
        input.title !== undefined || input.body !== undefined || input.status !== undefined;

      if (hasGitHubChanges) {
        const state: GitHubIssueState | undefined =
          input.status !== undefined ? (input.status ? 'closed' : 'open') : undefined;

        await this.gitHubService.updateIssue({
          repository: issue.repository,
          issueNumber: issue.githubNumber,
          ...(input.title !== undefined && { title: input.title }),
          ...(input.body !== undefined && { body: input.body }),
          ...(state !== undefined && { state }),
        });
      }
    }

    const updatedIssues = [...issues];
    updatedIssues[index] = updated;
    subTask.updateMetadata({ issues: updatedIssues });
    await this.taskRepository.save(task);
  }
}
