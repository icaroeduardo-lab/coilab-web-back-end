import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';

export interface DevelopmentIssue {
  id: string;
  title: string;
  url: string;
  flowId: number;
  completionDate?: string;
  sprint?: string;
  status: boolean;
}

export interface AddIssueToSubTaskInput {
  taskId: string;
  subTaskId: string;
  title: string;
  url: string;
  flowId: number;
  completionDate?: string;
  sprint?: string;
}

export class AddIssueToSubTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: AddIssueToSubTaskInput): Promise<{ id: string }> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);
    if (subTask.getTypeId() !== 4) throw new Error('SubTask não é do tipo Desenvolvimento');

    const existing = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];
    const issueId = generateId();
    const issue: DevelopmentIssue = {
      id: issueId,
      title: input.title,
      url: input.url,
      flowId: input.flowId,
      completionDate: input.completionDate,
      sprint: input.sprint,
      status: false,
    };

    subTask.updateMetadata({ issues: [...existing, issue] });
    await this.taskRepository.save(task);
    return { id: issueId };
  }
}
