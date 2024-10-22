import { readFile } from 'node:fs/promises';

import glob from 'fast-glob';

const exports = await glob.async('src/{transformers,utils}/!(*.spec).ts', { onlyFiles: true });
const barrel = await readFile('./src/index.ts', 'utf-8');

describe('barrel', () => {
  // lazy boy does not want to check all exports every time
  // and neither does he want to generate the barrel file
  it.each(exports)('exports %s', async file => {
    const js = file.replace(/^src/, '.').replace(/\.ts$/, '.js');
    expect(barrel).toEqual(expect.stringContaining(`export * from '${js}';`));
  });
});
