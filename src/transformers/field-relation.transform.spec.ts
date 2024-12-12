import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';
import z from 'zod';

import { transformRelationField } from './field-relation.transform.js';

describe('field-relation.transform', () => {
  function buildField(
    partial: Partial<CmsFieldBase & CmsFieldRelation>,
  ): CmsFieldBase & CmsFieldRelation {
    return {
      name: 'test_field',
      widget: 'relation',
      collection: 'authors',
      multiple: false,
      required: true,
      search_fields: ['name'],
      value_field: 'name',
      display_fields: ['name'],
      ...partial,
    };
  }

  // Helper to normalise cptime quotes
  function normaliseCptime(cptime: string): string {
    return cptime.replace(/'/g, '"');
  }

  it('transforms a single required relation', () => {
    const field = buildField({ multiple: false, required: true, collection: 'authors' });
    const { runtime, cptime } = transformRelationField(field, z);

    // runtime should be a z.string()
    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodString);
    // cptime should use reference("authors") without optional()
    expect(normaliseCptime(cptime)).toBe('reference("authors")');
    // parsing valid values
    expect(() => runtime.parse('some-author-id')).not.toThrow();
    // parsing invalid values
    expect(() => runtime.parse(['not allowed'])).toThrow();
  });

  it('transforms a single optional relation', () => {
    const field = buildField({ multiple: false, required: false, collection: 'authors' });
    const { runtime, cptime } = transformRelationField(field, z);

    // runtime should be optional z.string()
    expect(runtime.isOptional()).toBe(true);
    // cptime should use reference("authors").optional()
    expect(normaliseCptime(cptime)).toBe('reference("authors").optional()');
    // parsing valid values
    expect(() => runtime.parse('some-author-id')).not.toThrow();
    // parsing undefined or empty (allowed for optional)
    expect(() => runtime.parse(undefined)).not.toThrow();
  });

  it('transforms a multiple required relation', () => {
    const field = buildField({ multiple: true, required: true, collection: 'tags' });
    const { runtime, cptime } = transformRelationField(field, z);

    // runtime should be a z.array(z.string())
    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodArray);
    // cptime should use z.array(reference("tags"))
    expect(normaliseCptime(cptime)).toBe('z.array(reference("tags"))');
    // parsing valid values
    expect(() => runtime.parse(['tag1', 'tag2'])).not.toThrow();
    // parsing non-array should fail
    expect(() => runtime.parse('invalid')).toThrow();
  });

  it('transforms a multiple optional relation', () => {
    const field = buildField({ multiple: true, required: false, collection: 'categories' });
    const { runtime, cptime } = transformRelationField(field, z);

    // runtime should be optional z.array(z.string())
    expect(runtime.isOptional()).toBe(true);
    // cptime should use z.array(reference("categories")).optional()
    expect(normaliseCptime(cptime)).toBe('z.array(reference("categories")).optional()');
    // parsing valid values
    expect(() => runtime.parse(['cat1', 'cat2'])).not.toThrow();
    // parsing undefined is allowed
    expect(() => runtime.parse(undefined)).not.toThrow();
  });
});
