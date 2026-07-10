import { TaskStatus } from '../../../../domain/entities/task-status.enum';
import { TaskPriority } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';

export interface DashboardStatsOutput {
  total: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export class GetDashboardStatsUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<DashboardStatsOutput> {
    const tasks = await this.taskRepository.findAll({ skip: 0, take: 10000 });

    const total = tasks.length;

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    let inProgress = 0;
    let completed = 0;
    let highPriority = 0;

    for (const task of tasks) {
      const status = task.getStatus();
      const priority = task.getPriority();

      byStatus[status] = (byStatus[status] || 0) + 1;
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      if (
        status === TaskStatus.EM_EXECUCAO ||
        status === TaskStatus.DESENVOLVIMENTO ||
        status === TaskStatus.TESTES ||
        status === TaskStatus.CHECKOUT
      ) {
        inProgress++;
      }

      if (status === TaskStatus.CONCLUIDO) {
        completed++;
      }

      if (priority === TaskPriority.ALTA) {
        highPriority++;
      }
    }

    return {
      total,
      inProgress,
      completed,
      highPriority,
      byStatus,
      byPriority,
    };
  }
}
