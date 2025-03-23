/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'Node16',
      }
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
    '^@modelcontextprotocol/sdk$': '<rootDir>/node_modules/@modelcontextprotocol/sdk/dist/esm/index.js',
    '^@modelcontextprotocol/sdk/(.*)$': '<rootDir>/node_modules/@modelcontextprotocol/sdk/dist/esm/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(winston|@jest/globals|node-fetch|@modelcontextprotocol/sdk|pkce-challenge)/.*)'
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testTimeout: 30000,
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  globals: {
    TextEncoder: require('util').TextEncoder,
    TextDecoder: require('util').TextDecoder,
    crypto: {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
      }
    }
  }
}; 