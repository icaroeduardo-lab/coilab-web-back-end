/** @type {import('jest').Config} */
module.exports = {
  testMatch: ['**/*.integration.spec.ts'],
  transform: { '^.+\\.tsx?$': ['@swc/jest'] },
  setupFiles: ['./src/infra/db/prisma/test/setup-env.ts'],
  globalSetup: './src/infra/db/prisma/test/global-setup.ts',
  globalTeardown: './src/infra/db/prisma/test/global-teardown.ts',
  testTimeout: 30000,
};
