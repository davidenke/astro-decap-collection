// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/astro/types/content.d.ts" />

import type { BaseSchema, defineCollection } from 'astro:content';

export function prepareSchema<S extends BaseSchema>(
  schema: S,
): ReturnType<typeof defineCollection> {
  return { type: 'content', schema };
}
