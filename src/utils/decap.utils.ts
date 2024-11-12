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

export async function loadDecapConfig(ymlPath: string): Promise<CmsConfig | undefined> {
  const { existsSync } = await import('node:fs');
  const { readFile } = await import('node:fs/promises');

  // does the config file exist?
  if (!existsSync(ymlPath)) {
    return Promise.reject(new Error(`File not found: ${ymlPath}`));
  }

  // ... and use it to process the config file
  const configRaw = await readFile(ymlPath, 'utf8');
  return parseConfig(configRaw);
}

export async function parseConfig(ymlData: string): Promise<CmsConfig | undefined> {
  // in order to use the config utils from Decap CMS in Node,
  // we need to mock some globals first
  if (!('window' in globalThis)) {
    (globalThis as any).__store = {};
    (globalThis as any).localStorage = {
      getItem: (k: string): string => (globalThis as any).__store[k],
      setItem: (k: string, v: string) => ((globalThis as any).__store[k] = v),
      removeItem: (k: string) => delete (globalThis as any).__store[k],
    };
    (globalThis as any).window = {
      document: { createElement: () => ({}) },
      navigator: { userAgent: 'Node.js' },
      history: { pushState: () => {}, replaceState: () => {} },
      location: { href: 'http://localhost', replace: () => {} },
      URL: { createObjectURL: URL.createObjectURL } as any,
    };
  }

  // load the original tooling...
  let decapConfig = await import('decap-cms-core/dist/esm/actions/config.js');
  if ('default' in decapConfig) decapConfig = decapConfig.default as any;

  try {
    return decapConfig.normalizeConfig(decapConfig.parseConfig(ymlData) ?? {});
  } catch (error) {
    console.warn('Problems parsing Decap CMS config:', error);
    return undefined;
  }
}

export function getCollection(config: CmsConfig, name: string): CmsCollection | undefined {
  return config.collections.find(collection => collection.name === name);
}
