import type { CmsFieldBase, CmsFieldCode } from 'decap-cms-core';
import * as z from 'zod';

import { transformCodeField } from './field-code.transform.js';

describe('field-string.transform', () => {
  it('always sets the code along with the language', () => {
    const field = { name: 'foo', widget: 'code' } as CmsFieldBase & CmsFieldCode;
    const { compiled } = transformCodeField(field);
    const runtime = parseShape(compiled, { z });
    const { shape } = runtime as z.ZodObject<any>;
    expect(shape).toHaveProperty('code');
    expect(shape).toHaveProperty('language');
    expect(shape.code).toBeInstanceOf(z.ZodString);
    expect(shape.language).toBeInstanceOf(z.ZodString);
  });
});
