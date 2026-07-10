import { SubTask } from '../../../../domain/entities/sub-task.entity';
import { TaskStatus } from '../../../../domain/entities/task-status.enum';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { IApplicantRepository } from '../../../../domain/repositories/IApplicantRepository';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ApplicantId, ProjectId } from '../../../../domain/shared/entity-ids';
import {
  PaginationInput,
  PaginatedOutput,
  toPagination,
} from '../../../../domain/shared/pagination';
import { SubTaskSummaryOutput, TaskListOutput, TASK_TYPE_TO_ID } from '../shared/task-output';

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

function shouldIncludeTask(task: { getStatus(): string; getCreatedAt(): Date }): boolean {
  const status = task.getStatus();
  if (status !== TaskStatus.CONCLUIDO) {
    return true;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return task.getCreatedAt() >= thirtyDaysAgo;
}

export class ListAllTasksUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly applicantRepository: IApplicantRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input?: Partial<PaginationInput>): Promise<PaginatedOutput<TaskListOutput>> {
    const { page, limit } = toPagination(input?.page, input?.limit);
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskRepository.findAll({ skip, take: limit }),
      this.taskRepository.count(),
    ]);

    const filteredTasks = tasks.filter(shouldIncludeTask);

    if (filteredTasks.length === 0) return { data: [], total, page, limit };

    const uniqueApplicantIds = [
      ...new Set(filteredTasks.map((t) => ApplicantId(t.getApplicantId()))),
    ];
    const uniqueProjectIds = [...new Set(filteredTasks.map((t) => ProjectId(t.getProjectId())))];

    const [applicants, projects] = await Promise.all([
      this.applicantRepository.findByIds(uniqueApplicantIds),
      this.projectRepository.findByIds(uniqueProjectIds),
    ]);

    const applicantMap = new Map(applicants.map((a) => [a.getId(), a]));
    const projectMap = new Map(projects.map((p) => [p.getId(), p]));

    const data = filteredTasks.map((task) => {
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
        typeId: TASK_TYPE_TO_ID[task.getType()],
        description: task.getDescription(),
        createdAt: task.getCreatedAt(),
        applicant: { id: applicant.getId(), name: applicant.getName() },
        project: { id: project.getId(), name: project.getName() },
        subTasks: latestSubTaskPerType(task.getSubTasks()),
      };
    });

    return { data, total, page, limit };
  }
}
