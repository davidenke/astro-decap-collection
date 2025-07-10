import type { CmsField, CmsFieldBase, CmsFieldObject } from 'decap-cms-core';
import * as z from 'zod/v3';

import { transformObjectField } from './field-object.transform.js';

describe('field-object.transform', () => {
  it('allows parsing with correct schema', () => {
    const field = {
      name: 'foo',
      widget: 'object',
      fields: [
        { name: 'foo', widget: 'text' } as CmsField,
        { name: 'bar', widget: 'number' } as CmsField,
      ],
    } as CmsFieldBase & CmsFieldObject;
    const { compiled } = transformObjectField(field);
    const runtime = parseShape(compiled, { z });
    const result = { foo: 'foo', bar: 123 };
    expect(() => runtime.parse(result)).not.toThrow();
  });

  it('flattens all nested dependencies', () => {
    const field = {
      name: 'foo',
      widget: 'object',
      fields: [
        { name: 'foo', widget: 'text' } as CmsField,
        { name: 'bar', widget: 'number' } as CmsField,
      ],
    } as CmsFieldBase & CmsFieldObject;
    const { dependencies } = transformObjectField(field);
    // it's five instead of three, as `z.describe` is added for each field
    expect(dependencies).toEqual(['z', 'z', 'z', 'z', 'z']);
  });
});
