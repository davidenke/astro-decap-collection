import type { CmsField, CmsFieldRelation } from 'decap-cms-core';
import * as z from 'zod';

import { transformRelationField } from './field-relation.transform.js';

describe('field-relation.transform', () => {
  // a base relation field configuration
  const example = {
    name: 'test_field',
    widget: 'relation',
    search_fields: ['name'],
    value_field: 'name',
    display_fields: ['name'],
  } as CmsField & CmsFieldRelation;

  // stubs the reference function dependency
  const reference = () => z.string();

  it('transforms a single required relation field into a string schema', () => {
    const field = { ...example, multiple: false, required: true, collection: 'authors' };
    const { compiled } = transformRelationField(field);
    const runtime = parseShape(compiled, { z, reference });

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodString);
    expect(compiled).toBe("reference('authors')");
    expect(() => runtime.parse('some-author-id')).not.toThrow();
    expect(() => runtime.parse(['not allowed'])).toThrow();
  });

  it('transforms a single non-required relation field into the same string schema', () => {
    const field = { ...example, multiple: false, required: false, collection: 'authors' };
    const { compiled } = transformRelationField(field);
    const runtime = parseShape(compiled, { z, reference });

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodString);
    expect(compiled).toBe("reference('authors')");
    expect(() => runtime.parse('some-author-id')).not.toThrow();
  });

  it('transforms a multiple required relation field into an array of strings schema', () => {
    const field = { ...example, multiple: true, required: true, collection: 'tags' };
    const { compiled } = transformRelationField(field);
    const runtime = parseShape(compiled, { z, reference });

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodArray);
    expect(compiled).toBe("z.array(reference('tags'))");
    expect(() => runtime.parse(['tag1', 'tag2'])).not.toThrow();
    expect(() => runtime.parse('invalid')).toThrow();
  });

  it('transforms a multiple non-required relation field into the same array schema', () => {
    const field = { ...example, multiple: true, required: false, collection: 'categories' };
    const { compiled } = transformRelationField(field);
    const runtime = parseShape(compiled, { z, reference });

    expect(runtime._def.typeName).toBe(z.ZodFirstPartyTypeKind.ZodArray);
    expect(compiled).toBe("z.array(reference('categories'))");
    expect(() => runtime.parse(['cat1', 'cat2'])).not.toThrow();
  });
});
