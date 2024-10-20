import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import type { CmsCollection, CmsConfig } from 'decap-cms-core';

// TODO use the CmsField['widget'] type from decap-cms-core but exclude the generic string somehow
export type DecapWidgetType =
  | 'boolean'
  | 'code'
  | 'color'
  | 'datetime'
  | 'file'
  | 'hidden'
  | 'image'
  | 'list'
  | 'map'
  | 'markdown'
  | 'number'
  | 'object'
  | 'relation'
  | 'select'
  | 'string'
  | 'text';

export async function loadDecapConfig(ymlPath: string): Promise<CmsConfig> {
  // does the config file exist?
  if (!existsSync(ymlPath)) {
    return Promise.reject(new Error(`File not found: ${ymlPath}`));
  }

  // in order to use the config utils from Decap CMS, we need to mock some globals first
  (globalThis as any).__store = {};
  (globalThis as any).localStorage = {
    getItem: (k: string): string => globalThis.__store[k],
    setItem: (k: string, v: string) => (globalThis.__store[k] = v),
    removeItem: (k: string) => delete globalThis.__store[k],
  };

  (globalThis as any).window = {
    document: { createElement: () => ({}) },
    navigator: { userAgent: 'Node.js' },
    history: { pushState: () => {}, replaceState: () => {} },
    location: { href: 'http://localhost', replace: () => {} },
    URL: { createObjectURL: URL.createObjectURL } as any,
  };

  // load the original tooling...
  const { parseConfig, normalizeConfig } = await import(
    'decap-cms-core/dist/esm/actions/config.js'
  );

  // ... and use it to process the config file
  const configRaw = await readFile(ymlPath, 'utf8');
  return normalizeConfig(parseConfig(configRaw));
}

export function getCollection(config: CmsConfig, name: string): CmsCollection | undefined {
  return config.collections.find(collection => collection.name === name);
}
