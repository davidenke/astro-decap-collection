declare module 'decap-cms-core/dist/esm/actions/config.js' {
  import type { CmsConfig } from 'decap-cms-core';

  export function parseConfig(data: string): Partial<CmsConfig | null>;
  export function normalizeConfig(config: Partial<CmsConfig>): CmsConfig;
}
