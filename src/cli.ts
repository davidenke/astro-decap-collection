import { existsSync } from 'node:fs';
import { rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { parseArgs } from 'node:util';

import { loadDecapConfig } from './utils/decap.utils.js';
import { formatCode } from './utils/format.utils.js';
import { transformCollection } from './utils/transform.utils.js';

// parse cli arguments
const { values } = parseArgs({
  options: {
    config: { type: 'string', short: 'c' },
    target: { type: 'string', short: 't' },
  },
});
const { config, target } = values;

// check for required arguments
function fail(message: string, exitCode = 1) {
  console.error(message);
  exit(exitCode);
}

if (!config) {
  fail('Missing required argument: --config. Provide a path to the Decap config.yml file.');
}

if (!target) {
  fail('Missing required argument: --target. Provide a path where the collections will be stored.');
}

// read config and transform collections
const zod = await import('zod');
const { collections = [] } = (await loadDecapConfig(config!)) ?? {};
await Promise.all(
  collections.map(async collection => {
    // transform collection
    const { cptime } = transformCollection(collection, { zod });
    const path = resolve(target!, `config.${collection.name}.ts`);

    // build content and prettify if possible
    const raw = `import { z } from 'astro:content';\n\nexport const schema = ${cptime};\n`;
    const pretty = await formatCode(raw, 'typescript');

    // store schema
    if (existsSync(path)) await rm(path);
    await writeFile(path, pretty, 'utf-8');

    // inform user
    console.log(`> ${collection.name} schema written to ...${path.substring(path.length - 35)}`);
  }),
);
