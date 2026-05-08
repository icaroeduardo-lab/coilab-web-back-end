import { prisma } from '../../../../infra/db/prisma/prisma.client';

export interface TaskToolOutput {
  id: number;
  name: string;
}

export class ListTaskToolsUseCase {
  async execute(): Promise<TaskToolOutput[]> {
    return prisma.taskTool.findMany({ orderBy: { id: 'asc' } });
  }
}
