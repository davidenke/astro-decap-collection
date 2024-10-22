import { existsSync } from 'node:fs';
import { mkdir, rm, watch, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { parseArgs } from 'node:util';

import { loadDecapConfig } from './utils/decap.utils.js';
import { formatCode } from './utils/format.utils.js';
import { transformCollection } from './utils/transform.utils.js';

enum ERRORS {
  MISSING_CONFIG = 'Missing required argument: --config. Please provide a path to the Decap config.yml file.',
  MISSING_TARGET = 'Missing required argument: --target. Please provide a path where the collections will be stored.',
}

// parse cli arguments
const { values } = parseArgs({
  options: {
    config: { type: 'string', short: 'c' },
    target: { type: 'string', short: 't' },
    watch: { type: 'boolean', short: 'w' },
  },
});
const { config, target, watch: useWatch } = values;

// check for required arguments
function fail(message: string, exitCode = 1) {
  console.error(message);
  exit(exitCode);
}

// read config and transform collections
export async function loadAndTransformCollections(from?: string, to?: string, isUpdate = false) {
  if (!from) return fail(ERRORS.MISSING_CONFIG);
  if (!to) return fail(ERRORS.MISSING_TARGET);

  const zod = await import('zod');
  const { collections = [] } = (await loadDecapConfig(from)) ?? {};
  await Promise.all(
    collections.map(async collection => {
      // transform collection
      const { cptime } = transformCollection(collection, { zod });
      const path = resolve(to, `config.${collection.name}.ts`);

      // build content and prettify if possible
      const raw = `import { z } from 'astro:content';\n\nexport const schema = ${cptime};\n`;
      const pretty = await formatCode(raw, 'typescript');

      // prepare folder if non-existent, remove existing and write file
      if (!existsSync(to)) await mkdir(to, { recursive: true });
      if (existsSync(path)) await rm(path);
      await writeFile(path, pretty, 'utf-8');

      // inform user
      const action = isUpdate ? 'updated at' : 'written to';
      const shortPath = path.substring(path.length - 35);
      console.log(`> ${collection.name} schema ${action} ...${shortPath}`);
    }),
  );
}

// run once or watch for changes
if (useWatch) {
  // prepare abort controller
  const abort = new AbortController();
  const { signal } = abort;
  process.on('SIGINT', () => abort.abort());

  try {
    const watcher = watch(config!, { encoding: 'utf-8', signal });
    for await (const { eventType } of watcher) {
      if (eventType === 'change') {
        await loadAndTransformCollections(config, target, true);
      }
    }
  } catch (error: any) {
    // throw error if not aborted
    if (error?.name === 'AbortError') exit(0);
    throw error;
  }
} else {
  await loadAndTransformCollections(config, target, false);
}
