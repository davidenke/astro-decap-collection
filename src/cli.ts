#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, rm, watch, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { exit, stdout } from 'node:process';
import { parseArgs } from 'node:util';

import glob from 'fast-glob';

import { loadDecapConfig } from './utils/decap.utils.js';
import { formatCode } from './utils/format.utils.js';
import { transformCollection } from './utils/transform.utils.js';

enum ERROR {
  MISSING_CONFIG = 'Missing config path. Please provide a path to the Decap config.yml file as positional.',
  MISSING_TARGET = 'Missing required argument: --target. Please provide a path where the collections will be stored.',
  ZOD_MISSING = 'Zod is required for schema validation. Please install it by running `npm install zod`.',
  PARSING_FAILED = 'Failed to parse the Decap config file.',
  FORMATTING_FAILED = 'Failed to format the generated schema.',
  WRITING_FAILED = 'Failed to write the generated schema to the target folder.',
}

// check for required arguments
function fail(message: string, exitCode = 1) {
  console.error(message);
  exit(exitCode);
}

function tryOrFail<T>(fn: () => T, error: ERROR, exitCode: false | number = 1): T {
  try {
    return fn();
  } catch (_) {
    fail(error);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    exitCode && exit(1);
    return undefined as never;
  }
}

// read config and transform collections
export async function loadAndTransformCollections(
  from: string,
  to: string,
  naming = 'config.%%name%%.ts',
  isUpdate = false,
) {
  const zod = await tryOrFail(() => import('zod'), ERROR.ZOD_MISSING);
  const config = await tryOrFail(() => loadDecapConfig(from), ERROR.PARSING_FAILED);
  const { collections = [] } = config ?? {};

  await Promise.all(
    collections.map(async collection => {
      // transform collection
      const { cptime } = transformCollection(collection, { zod });
      const keys = { name: collection.name };
      const name = naming.replace(/%%(\w+)%%/, (_, k: keyof typeof keys) => keys[k] ?? _);
      const path = resolve(to, name);

      // build content and prettify if possible
      const raw = `import { z } from 'astro:content';\n\nexport const schema = ${cptime};\n`;
      const pretty = await tryOrFail(() => formatCode(raw, 'typescript'), ERROR.FORMATTING_FAILED);

      // prepare folder if non-existent, remove existing and write file
      if (!existsSync(to)) await mkdir(to, { recursive: true });
      if (existsSync(path)) await rm(path);
      await tryOrFail(() => writeFile(path, pretty, 'utf-8'), ERROR.WRITING_FAILED);

      // inform user
      const action = isUpdate ? 'updated at' : 'written to';
      const before = `> ${collection.name} schema ${action} `;
      const { columns = 120 } = stdout;
      const dots = '...';
      const chars = before.length + dots.length;
      const shortPath = `${dots}${path.substring(path.length - columns + chars)}`;
      const message = `${before}${path.length < columns - chars ? path : shortPath}`;
      console.info(message);
    }),
  );
}

async function run() {
  // parse cli arguments
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      config: { type: 'string', short: 'c' },
      target: { type: 'string', short: 't' },
      naming: { type: 'string', short: 'n' },
      watch: { type: 'boolean', short: 'w' },
    },
  });
  const { config, target, naming, watch: useWatch } = values;
  const input = [...positionals, config].filter(Boolean) as string[];

  // everything there?
  if (!input.length) return fail(ERROR.MISSING_CONFIG);
  if (!target) return fail(ERROR.MISSING_TARGET);

  // as the config path can be a glob pattern, which is not
  // extended by all shells; so we use fast-glob here
  const configs = await glob(input, { onlyFiles: true });

  // run once before watch, or just to create the files
  await Promise.all(configs.map(c => loadAndTransformCollections(c, target, naming, false)));

  // run once or watch for changes
  if (useWatch) {
    // prepare abort controller
    const abort = new AbortController();
    const { signal } = abort;
    process.on('SIGINT', () => abort.abort());
    console.info('> Watching for changes ...');

    // watch for changes
    configs.forEach(async config => {
      try {
        const watcher = watch(config, { encoding: 'utf-8', signal });
        for await (const { eventType } of watcher) {
          if (eventType === 'change') {
            await loadAndTransformCollections(config, target, naming, true);
          }
        }
      } catch (error: any) {
        // throw error if not aborted
        if (error?.name === 'AbortError') exit(0);
        throw error;
      }
    });
  }
}

run();
