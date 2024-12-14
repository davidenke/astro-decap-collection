import type { CmsField, CmsFieldBase, CmsFieldList } from 'decap-cms-core';
import * as z from 'zod';

import { transformListField } from './field-list.transform.js';

describe('field-list.transform', () => {
  it('allows parsing with field based schema', () => {
    const field = {
      name: 'foo',
      widget: 'list',
      field: { name: 'foo', widget: 'text' } as CmsField,
    } as CmsFieldBase & CmsFieldList;
    const { compiled } = transformListField(field);
    const runtime = parseShape(compiled, { z });
    const result = ['foo', 'bar', 'baz'];
    expect(() => runtime.parse(result)).not.toThrow();
  });

  it('allows parsing with fields based schema', () => {
    const field = {
      name: 'foo',
      widget: 'list',
      fields: [
        { name: 'foo', widget: 'text' } as CmsField,
        { name: 'bar', widget: 'number' } as CmsField,
      ],
    } as CmsFieldBase & CmsFieldList;
    const { compiled } = transformListField(field);
    const runtime = parseShape(compiled, { z });
    const result = [{ foo: 'foo', bar: 123 }];
    expect(() => runtime.parse(result)).not.toThrow();
  });

  it('allows parsing with type based schema', () => {
    const field = {
      name: 'foo',
      widget: 'list',
      types: [
        {
          name: 'foo',
          fields: [
            { name: 'foo', widget: 'text' } as CmsField,
            { name: 'bar', widget: 'number' } as CmsField,
          ],
        },
      ],
    } as CmsFieldBase & CmsFieldList;
    const { compiled } = transformListField(field);
    const runtime = parseShape(compiled, { z });
    const result = [{ type: 'foo', foo: 'foo', bar: 123 }];
    expect(() => runtime.parse(result)).not.toThrow();
  });
});
