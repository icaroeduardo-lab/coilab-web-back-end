import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { DevelopmentIssue } from '../add-issue-to-subtask/AddIssueToSubTaskUseCase';

export interface RemoveIssueFromSubTaskInput {
  taskId: string;
  subTaskId: string;
  issueId: string;
}

export class RemoveIssueFromSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: RemoveIssueFromSubTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);
    if (subTask.getTypeId() !== 4) throw new Error('SubTask não é do tipo Desenvolvimento');

    const issues = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];
    const issue = issues.find((i) => i.id === input.issueId);
    if (!issue) throw new Error(`Issue não encontrada: ${input.issueId}`);
    if (issue.status === true) throw new Error('Issue concluída não pode ser removida');

    subTask.updateMetadata({ issues: issues.filter((i) => i.id !== input.issueId) });
    await this.taskRepository.save(task);
  }
}
