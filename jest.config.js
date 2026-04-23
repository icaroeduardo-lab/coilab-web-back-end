module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.ts$'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/domain/entities/**/*.ts',
    'src/domain/shared/**/*.ts',
    'src/domain/validators/**/*.ts',
    'src/domain/value-objects/**/*.ts',
    'src/application/use-cases/**/*.ts',
    'src/modules/**/*.controller.ts',
    'src/modules/shared/http-exception.filter.ts',
    '!src/**/*.spec.ts',
    '!src/application/use-cases/**/shared/**',
  ],
};