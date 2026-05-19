import { IGitHubService, GitHubRepo } from '../../../../domain/repositories/IGitHubService';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { DomainException } from '../../../../domain/shared/domain.exception';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { COILAB_WEB_PROJECT_ID } from '../../../../domain/shared/project-constants';
import { generateId } from '../../../../shared/generate-id';

export interface DevelopmentIssue {
  id: string;
  title: string;
  url?: string;
  githubNumber?: number;
  repository?: GitHubRepo;
  flowId: number;
  completionDate?: string;
  sprint?: string;
  status: boolean;
}

export interface AddIssueToSubTaskInput {
  taskId: string;
  subTaskId: string;
  title: string;
  repository?: GitHubRepo;
  body?: string;
  flowId: number;
  completionDate?: string;
  sprint?: string;
}

export class AddIssueToSubTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly gitHubService: IGitHubService,
  ) {}

  async execute(input: AddIssueToSubTaskInput): Promise<{ id: string; url?: string }> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    task.assertEditable();

    const subTask = task.getSubTasks().find((s) => s.getId() === input.subTaskId);
    if (!subTask) throw new Error(`SubTask not found: ${input.subTaskId}`);
    if (subTask.getTypeId() !== 4) throw new Error('SubTask não é do tipo Desenvolvimento');

    const isCoilabWeb = task.getProjectId() === COILAB_WEB_PROJECT_ID;

    if (isCoilabWeb) {
      if (!input.repository)
        throw new DomainException('repository é obrigatório para projetos coilab-web');
      if (input.sprint)
        throw new DomainException('sprint não é permitido para projetos coilab-web');
    } else {
      if (input.repository)
        throw new DomainException('repository é exclusivo para projetos coilab-web');
    }

    const existing = (subTask.getMetadata().issues ?? []) as DevelopmentIssue[];
    const issueId = generateId();
    const issue: DevelopmentIssue = {
      id: issueId,
      title: input.title,
      flowId: input.flowId,
      completionDate: input.completionDate,
      status: false,
    };

    if (isCoilabWeb) {
      const { url, number } = await this.gitHubService.createIssue({
        repository: input.repository!,
        title: input.title,
        body: input.body,
      });
      issue.url = url;
      issue.githubNumber = number;
      issue.repository = input.repository;
    } else {
      issue.sprint = input.sprint;
    }

    subTask.updateMetadata({ issues: [...existing, issue] });
    await this.taskRepository.save(task);
    return { id: issueId, url: issue.url };
  }
}
