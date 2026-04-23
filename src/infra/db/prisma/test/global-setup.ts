import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

export default async function globalSetup() {
  dotenv.config({ path: '.env.test' });
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });
}
