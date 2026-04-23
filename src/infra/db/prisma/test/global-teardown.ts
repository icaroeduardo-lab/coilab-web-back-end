import * as dotenv from 'dotenv';
import { PrismaClient } from '../../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export default async function globalTeardown() {
  dotenv.config({ path: '.env.test' });
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const client = new PrismaClient({ adapter });
  await client.$disconnect();
}
