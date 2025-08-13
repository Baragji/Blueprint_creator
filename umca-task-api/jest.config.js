export default {
  testEnvironment: 'node',
  transform: {},
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/test/setup.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testTimeout: 10000,
  verbose: true
};