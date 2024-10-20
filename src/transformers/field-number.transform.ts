import type { CmsFieldBase, CmsFieldNumber } from 'decap-cms-core';
import type { ZodNumber } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#number
export const transformNumberField: Transformer<ZodNumber, CmsFieldBase & CmsFieldNumber> = (
  { max, min, value_type = 'int' },
  z,
) => {
  const transformed = {
    runtime: z.number().finite(),
    cptime: 'z.number().finite()',
  };

  // numbers can be float or int
  if (value_type === 'int') {
    transformed.runtime = transformed.runtime.int();
    transformed.cptime = `${transformed.cptime}.int()`;
  }

  // numbers can have min/max values
  if (min !== undefined) {
    transformed.runtime = transformed.runtime.min(min);
    transformed.cptime = `${transformed.cptime}.min(${min})`;
  }
  if (max !== undefined) {
    transformed.runtime = transformed.runtime.max(max);
    transformed.cptime = `${transformed.cptime}.max(${max})`;
  }

  return transformed;
};
