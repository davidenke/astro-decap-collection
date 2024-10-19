import type { CmsField, CmsFieldBase, CmsFieldObject } from 'decap-cms-core';
import z from 'zod';

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
    const { runtime } = transformObjectField(field, z);
    const result = { foo: 'foo', bar: 123 };
    expect(() => runtime.parse(result)).not.toThrow();
  });
});
