/// <reference path="../../node_modules/astro/types/content.d.ts" />

import type { BaseSchema, CollectionConfig } from 'astro:content';

export function prepareSchema<S extends BaseSchema>(schema: S): CollectionConfig<S> {
  return { type: 'content', schema };
}
