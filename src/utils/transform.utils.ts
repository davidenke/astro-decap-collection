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
 * Flags a field as optional if it is not required.
 */
export function applyOptional(field: Decap.CmsField, result: TransformResult): TransformResult {
  // it should be explicitly `optional()` or `nullable()`,
  // but for me it's not quite clear right now what is specified on the Decap side
  // fyi: https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e
  if (field.required === false) {
    return {
      runtime: result.runtime.nullish(),
      cptime: `${result.cptime}.nullish()`,
    };
  }
  return result;
}

/**
 * Sets a default value if reasonable.
 */
export function applyDefaultValue(field: Decap.CmsField, result: TransformResult): TransformResult {
  const { default: def } = field as { default?: any };
  // cannot set null as default value on mandatory fields
  if (def === undefined || (def === null && field.required)) {
    return result;
  }

  // set default value
  return {
    runtime: result.runtime.default(def),
    cptime: `${result.cptime}.default(${JSON.stringify(def)})`,
  };
}

/**
 * Derives and sets a description if available.
 */
export function applyDescription(field: Decap.CmsField, result: TransformResult): TransformResult {
  // derive potential description
  const description = field.hint ?? field.label ?? field.name;
  if (description === undefined) return result;

  // set a description
  return {
    runtime: result.runtime.describe(description),
    cptime: `${result.cptime}.describe('${description}')`,
  };
}

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
    collection.fields = collection.fields?.filter(({ name }) => name !== 'body');
    collection.files = collection.files?.reduce((acc, file) => {
      return [...acc, { ...file, fields: file.fields.filter(({ name }) => name !== 'body') }];
    }, [] as Decap.CmsCollectionFile[]);
  }

  // we can process folder collections with its fields like every other object
  if ('folder' in collection) {
    const { name, fields = [] } = collection;
    const field = { name, fields, widget: 'object' as const };
    return transformObjectField(field, zod);
  }

  // file collections are for now union types of all defined types; that might
  // change in the future, as it should be possible to define different collection
  // data types in astro... (?)
  if (Array.isArray(collection.files)) {
    const results = collection.files.map(file => {
      const { name, fields = [] } = file;
      const field = { name, fields, widget: 'object' as const };
      return transformObjectField(field, zod);
    });
    return {
      cptime: `z.union([${results.map(({ cptime }) => cptime).join(', ')}])`,
      runtime: zod.union(results.map(({ runtime }) => runtime) as any),
    };
  }

  // a collection without a folder OR a file list is invalid, thus we define `never`
  return { runtime: zod.never(), cptime: 'z.never()' };
}
