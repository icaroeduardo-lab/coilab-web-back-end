import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';

export interface UpdateIssueInSubTaskInput {
  taskId: string;
  subTaskId: string;
  issueId: string;
  title?: string;
  url?: string;
  flowId?: number;
  completionDate?: string;
  sprint?: string;
  status?: boolean;
}

export class UpdateIssueInSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: UpdateIssueInSubTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);
    if (subTask.getTypeId() !== 4) throw new Error('SubTask não é do tipo Desenvolvimento');

    const issues = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];
    const index = issues.findIndex((i) => i.id === input.issueId);
    if (index === -1) throw new Error(`Issue não encontrada: ${input.issueId}`);

    const issue = issues[index];

    if (issue.status === true && input.status !== false) {
      throw new Error('Issue concluída não pode ser editada');
    }

    if (input.status === true) {
      const effectiveSprint = input.sprint ?? issue.sprint;
      const effectiveCompletionDate = input.completionDate ?? issue.completionDate;
      if (!effectiveSprint || !effectiveCompletionDate) {
        throw new Error('Para concluir uma issue é necessário informar sprint e completionDate');
      }
    }

    const updated: DevelopmentIssue = {
      ...issue,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.url !== undefined && { url: input.url }),
      ...(input.flowId !== undefined && { flowId: input.flowId }),
      ...(input.completionDate !== undefined && { completionDate: input.completionDate }),
      ...(input.sprint !== undefined && { sprint: input.sprint }),
      ...(input.status !== undefined && { status: input.status }),
    };

    const updatedIssues = [...issues];
    updatedIssues[index] = updated;
    subTask.updateMetadata({ issues: updatedIssues });
    await this.taskRepository.save(task);
  }
}
