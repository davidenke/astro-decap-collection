import config, { setTsConfigRootDir } from '@enke.dev/lint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // extend the base config
  ...config,
  // configure typescript parser to your needs
  setTsConfigRootDir(import.meta.dirname),
]);
