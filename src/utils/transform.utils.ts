import type * as Decap from 'decap-cms-core';

import { transformObjectField } from '../transformers/field-object.transform.js';
import { escapeString } from './format.utils.js';

/**
 * Utility type defining a transformer function.
 */
export type Transformer<F = Decap.CmsField> = (field: F) => TransformResult;

/**
 * Utility type defining the result of a transformation.
 * It consists of a Zod schema string representation and an optional list of
 * dependencies to the generated astro content module. The latter usually
 * contains the `z` (zod) re-export of the Astro runtime.
 */
export interface TransformResult {
  // the compiled result as string
  compiled: string;
  // the optional list of dependencies - as we want this to be explicitly optional,
  // one must return at least an empty array if really no dependencies are required
  dependencies: string[];
}

/**
 * Flags a field as optional if it is not required.
 */
export function applyOptional(field: Decap.CmsField, result: TransformResult): TransformResult {
  // it should be explicitly `optional()` or `nullable()`,
  // but for me it's not quite clear right now what is specified on the Decap side
  // fyi: https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e
  if (field.required === false) {
    return {
      compiled: `${result.compiled}.nullish()`,
      dependencies: ['z', ...result.dependencies],
    };
  }
  return result;
}

/**
 * Sets a default value if reasonable.
 */
export function applyDefaultValue(field: Decap.CmsField, result: TransformResult): TransformResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: def } = field as { default?: any };
  // cannot set null as default value on mandatory fields
  if (def === undefined || (def === null && field.required)) {
    return result;
  }

  // set default value
  return {
    compiled: `${result.compiled}.default(${JSON.stringify(def)})`,
    dependencies: ['z', ...result.dependencies],
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
    compiled: `${result.compiled}.describe('${escapeString(description)}')`,
    dependencies: ['z', ...result.dependencies],
  };
}

/**
 * Transforms a Decap CMS collection config into an Astro collection schema.
 */
export function transformCollection(collection: Decap.CmsCollection): TransformResult {
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
    return transformObjectField(field);
  }

  // file collections are for now union types of all defined types; that might
  // change in the future, as it should be possible to define different collection
  // data types in astro... (?)
  if (Array.isArray(collection.files)) {
    const results = collection.files.map(file => {
      const { name, fields = [] } = file;
      const field = { name, fields, widget: 'object' as const };
      return transformObjectField(field);
    });
    // single file collection is just the result
    if (results.length === 1) return results[0];
    // multiple file collection is a union of all results
    return {
      compiled: `z.union([${results.map(({ compiled: cptime }) => cptime).join(', ')}])`,
      dependencies: ['z', ...results.flatMap(({ dependencies }) => dependencies)],
    };
  }

  // a collection without a folder OR a file list is invalid, thus we define `never`
  return { compiled: 'z.never()', dependencies: ['z'] };
}
