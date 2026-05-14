import { SubTask } from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ApplicantId, ProjectId } from '../../../../domain/shared/entity-ids';
import { SubTaskSummaryOutput, TaskListOutput } from '../shared/task-output';

function latestSubTaskPerType(subTasks: SubTask[]): SubTaskSummaryOutput[] {
  const map = new Map<number, SubTask>();
  for (const s of subTasks) {
    const existing = map.get(s.getTypeId());
    if (!existing || s.getCreatedAt() > existing.getCreatedAt()) {
      map.set(s.getTypeId(), s);
    }
  }
  return [...map.values()].map((s) => ({ typeId: s.getTypeId(), status: s.getStatus() }));
}

export interface ListTasksByProjectInput {
  projectId: string;
}

export class ListTasksByProjectUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly applicantRepository: IApplicantRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: ListTasksByProjectInput): Promise<TaskListOutput[]> {
    const tasks = await this.taskRepository.findByProjectId(ProjectId(input.projectId));

    if (tasks.length === 0) return [];

    const uniqueApplicantIds = [...new Set(tasks.map((t) => ApplicantId(t.getApplicantId())))];
    const uniqueProjectIds = [...new Set(tasks.map((t) => ProjectId(t.getProjectId())))];

    const [applicants, projects] = await Promise.all([
      this.applicantRepository.findByIds(uniqueApplicantIds),
      this.projectRepository.findByIds(uniqueProjectIds),
    ]);

    const applicantMap = new Map(applicants.map((a) => [a.getId(), a]));
    const projectMap = new Map(projects.map((p) => [p.getId(), p]));

    return tasks.map((task) => {
      const applicant = applicantMap.get(task.getApplicantId());
      const project = projectMap.get(task.getProjectId());

      if (!applicant) throw new Error(`Applicant not found: ${task.getApplicantId()}`);
      if (!project) throw new Error(`Project not found: ${task.getProjectId()}`);

      return {
        id: task.getId(),
        name: task.getName(),
        taskNumber: task.getTaskNumber(),
        priority: task.getPriority(),
        status: task.getStatus(),
        description: task.getDescription(),
        createdAt: task.getCreatedAt(),
        applicant: { id: applicant.getId(), name: applicant.getName() },
        project: { id: project.getId(), name: project.getName() },
        subTasks: latestSubTaskPerType(task.getSubTasks()),
      };
    });
  }
}
