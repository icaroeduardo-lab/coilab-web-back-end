import { Task } from '../entities/task.entity';
import { TaskId, ProjectId } from '../shared/entity-ids';

export interface ITaskRepository {
  findById(id: TaskId): Promise<Task | null>;
  findAll(opts?: { skip?: number; take?: number }): Promise<Task[]>;
  count(): Promise<number>;
  findByProjectId(projectId: ProjectId): Promise<Task[]>;
  findLastTaskNumber(): Promise<string | null>;
  save(task: Task): Promise<void>;
  delete(id: TaskId): Promise<void>;
}
