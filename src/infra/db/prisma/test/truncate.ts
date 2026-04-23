import { prisma } from '../prisma.client';

export async function truncateAll(): Promise<void> {
  await prisma.taskFlow.deleteMany();
  await prisma.subTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.flow.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();
}
