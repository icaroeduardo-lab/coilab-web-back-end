import { SubTask } from '../../../../domain/entities/sub-task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ApplicantId, ProjectId } from '../../../../domain/shared/entity-ids';
import { SubTaskSummaryOutput, TaskListOutput } from '../shared/task-output';

function latestSubTaskPerType(subTasks: SubTask[]): SubTaskSummaryOutput[] {
  const map = new Map<string, SubTask>();
  for (const s of subTasks) {
    const existing = map.get(s.getType());
    if (!existing || s.getCreatedAt() > existing.getCreatedAt()) {
      map.set(s.getType(), s);
    }
  }
  return [...map.values()].map((s) => ({ type: s.getType(), status: s.getStatus() }));
}

export class ListAllTasksUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly applicantRepository: IApplicantRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(): Promise<TaskListOutput[]> {
    const tasks = await this.taskRepository.findAll();

    const uniqueApplicantIds = [...new Set(tasks.map((t) => t.getApplicantId()))];
    const uniqueProjectIds = [...new Set(tasks.map((t) => t.getProjectId()))];

    const [applicants, projects] = await Promise.all([
      Promise.all(
        uniqueApplicantIds.map((id) => this.applicantRepository.findById(ApplicantId(id))),
      ),
      Promise.all(uniqueProjectIds.map((id) => this.projectRepository.findById(ProjectId(id)))),
    ]);

    const applicantMap = new Map(applicants.filter(Boolean).map((a) => [a!.getId(), a!]));
    const projectMap = new Map(projects.filter(Boolean).map((p) => [p!.getId(), p!]));

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
