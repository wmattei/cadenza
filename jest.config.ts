import { pathsToModuleNameMapper } from 'ts-jest';

export default {
  preset: 'ts-jest',
  displayName: 'Cadenza',
  testEnvironment: 'node',
  testMatch: ['**/test/e2e/**/*.test.ts'],
  transform: {
    '.*\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts'],
  maxWorkers: 1,
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      {},
      {
        prefix: '<rootDir>',
      },
    ),
  },
};
