import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project, ProjectStatus } from '../../../../domain/entities/project.entity';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { prisma } from '../prisma.client';
import type { Project as PrismaProject } from '../../../../generated/prisma/client';

function toDomain(row: PrismaProject): Project {
  return new Project({
    id: ProjectId(row.id),
    name: row.name,
    projectNumber: row.projectNumber,
    description: row.description,
    urlDocument: row.urlDocument ?? undefined,
    status: row.status as ProjectStatus,
    createdAt: row.createdAt,
  });
}

export class PrismaProjectRepository implements IProjectRepository {
  async findById(id: ProjectId): Promise<Project | null> {
    const row = await prisma.project.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByIds(ids: ProjectId[]): Promise<Project[]> {
    const rows = await prisma.project.findMany({ where: { id: { in: ids } } });
    return rows.map(toDomain);
  }

  async findAll(): Promise<Project[]> {
    const rows = await prisma.project.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toDomain);
  }

  async count(): Promise<number> {
    return prisma.project.count();
  }

  async findLastProjectNumber(): Promise<string | null> {
    const row = await prisma.project.findFirst({ orderBy: { projectNumber: 'desc' } });
    return row?.projectNumber ?? null;
  }

  async save(project: Project): Promise<void> {
    await prisma.project.upsert({
      where: { id: project.getId() },
      create: {
        id: project.getId(),
        name: project.getName(),
        projectNumber: project.getProjectNumber(),
        description: project.getDescription(),
        urlDocument: project.getUrlDocument(),
        status: project.getStatus(),
        createdAt: project.getCreatedAt(),
      },
      update: {
        name: project.getName(),
        description: project.getDescription(),
        urlDocument: project.getUrlDocument(),
        status: project.getStatus(),
      },
    });
  }
}
