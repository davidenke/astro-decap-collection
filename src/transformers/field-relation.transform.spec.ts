import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';
import z from 'zod';

import { transformRelationField } from './field-relation.transform.js';

describe('field-relation.transform', () => {
  // Constructs a base relation field configuration with overrides
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

  // Normalises quotes in the cptime output for consistent comparison
  function normaliseCptime(cptime: string): string {
    return cptime.replace(/'/g, '"');
  }

  it('transforms a single required relation field into a string schema', () => {
    const field = buildField({ multiple: false, required: true, collection: 'authors' });
    const { runtime, cptime } = transformRelationField(field, z);

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodString);
    expect(normaliseCptime(cptime)).toBe('reference("authors")');
    expect(() => runtime.parse('some-author-id')).not.toThrow();
    expect(() => runtime.parse(['not allowed'])).toThrow();
  });

  it('transforms a single non-required relation field into the same string schema', () => {
    const field = buildField({ multiple: false, required: false, collection: 'authors' });
    const { runtime, cptime } = transformRelationField(field, z);

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodString);
    expect(normaliseCptime(cptime)).toBe('reference("authors")');
    expect(() => runtime.parse('some-author-id')).not.toThrow();
  });

  it('transforms a multiple required relation field into an array of strings schema', () => {
    const field = buildField({ multiple: true, required: true, collection: 'tags' });
    const { runtime, cptime } = transformRelationField(field, z);

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodArray);
    expect(normaliseCptime(cptime)).toBe('z.array(reference("tags"))');
    expect(() => runtime.parse(['tag1', 'tag2'])).not.toThrow();
    expect(() => runtime.parse('invalid')).toThrow();
  });

  it('transforms a multiple non-required relation field into the same array schema', () => {
    const field = buildField({ multiple: true, required: false, collection: 'categories' });
    const { runtime, cptime } = transformRelationField(field, z);

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodArray);
    expect(normaliseCptime(cptime)).toBe('z.array(reference("categories"))');
    expect(() => runtime.parse(['cat1', 'cat2'])).not.toThrow();
  });
});
