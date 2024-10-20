import type * as Decap from 'decap-cms-core';
import type * as Zod from 'zod';

import { transformObjectField } from '../transformers/field-object.transform.js';

export type TransformOptions = {
  /**
   * Defines a custom Zod instance to be used.
   */
  zod: typeof Zod;
};

/**
 * Utility type defining a transformer function.
 */
export type Transformer<R = Zod.ZodType, F = Decap.CmsField> = (
  field: F,
  z: typeof Zod,
) => TransformResult<R>;

/**
 * Utility type defining the result of a transformation.
 * It consists of a Zod runtime type and a string representation of the Zod schema.
 * The latter is used to generate the content of a TypeScript file.
 */
export type TransformResult<R = Zod.ZodType> = {
  runtime: R;
  cptime: string;
};

/**
 * Transforms a Decap CMS collection config into an Astro collection schema.
 */
export function transformCollection(
  collection: Decap.CmsCollection,
  { zod }: TransformOptions,
): TransformResult {
  // There's another specialty on the Decap menu: if the collection format is 'frontmatter'
  // (or not set / `undefined`), then a field can be defined to parse the markdown body. All
  // other formats having bodies are documented to not parse the body at all. This means, we
  // skip the body field for the 'frontmatter' format (or just remove it).
  // https://decapcms.org/docs/configuration-options/?#extension-and-format
  const { format = 'frontmatter' } = collection;
  if (format === 'frontmatter') {
    collection.fields = collection.fields.filter(({ name }) => name !== 'body');
  }

  // we can process the collection with its fields like every other object
  return transformObjectField(collection as Decap.CmsFieldBase & Decap.CmsFieldObject, zod);
}
