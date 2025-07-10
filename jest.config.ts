import type { JestConfigWithTsJest } from 'ts-jest';
import { createJsWithTsEsmPreset } from 'ts-jest';

const esmPreset = createJsWithTsEsmPreset({ tsconfig: 'tsconfig.build.json' });
const jestConfig: JestConfigWithTsJest = {
  ...esmPreset,
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: { '(.+)\\.js': '$1' },
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/public/', '<rootDir>/tmp/'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  transform: { '\\.[jt]s?$': ['ts-jest', { useESM: true }] },
};

export default jestConfig;
