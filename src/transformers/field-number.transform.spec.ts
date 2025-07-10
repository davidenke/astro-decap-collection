import type { CmsFieldBase, CmsFieldNumber } from 'decap-cms-core';
import * as z from 'zod/v3';

import { transformNumberField } from './field-number.transform.js';

describe('field-number.transform', () => {
  let field: CmsFieldBase & CmsFieldNumber;

  beforeEach(() => {
    field = { name: 'foo', widget: 'number' };
  });

  it('can be integer', () => {
    const intField = { ...field, value_type: 'int' };
    const { compiled } = transformNumberField(intField);
    const runtime = parseShape(compiled, { z });
    const { checks } = runtime._def;
    expect(checks).toHaveLength(2);
    expect(checks).toEqual(expect.arrayContaining([{ kind: 'finite' }, { kind: 'int' }]));
  });

  it('can have a min value', () => {
    const minField = { ...field, min: 1 };
    const { compiled } = transformNumberField(minField);
    const runtime = parseShape(compiled, { z });
    const { checks } = runtime._def;
    expect(checks).toHaveLength(3);
    expect(checks).toEqual(expect.arrayContaining([{ kind: 'min', inclusive: true, value: 1 }]));
  });

  it('can have a max value', () => {
    const maxField = { ...field, max: 5 };
    const { compiled } = transformNumberField(maxField);
    const runtime = parseShape(compiled, { z });
    const { checks } = runtime._def;
    expect(checks).toHaveLength(3);
    expect(checks).toEqual(expect.arrayContaining([{ kind: 'max', inclusive: true, value: 5 }]));
  });
});
