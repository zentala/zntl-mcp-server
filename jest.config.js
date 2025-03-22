/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^node:(.*)$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!@modelcontextprotocol/sdk/.*|pkce-challenge/.*)'
  ],
  setupFiles: ['./jest.setup.js'],
  moduleDirectories: ['node_modules'],
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
};