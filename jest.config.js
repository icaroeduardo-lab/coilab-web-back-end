module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.ts$'],
  coverageProvider: 'v8',
};