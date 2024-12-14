import type { CmsFieldBase, CmsFieldNumber } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#number
export const transformNumberField: Transformer<CmsFieldBase & CmsFieldNumber> = ({
  max,
  min,
  value_type = 'int',
}) => {
  const transformed = { compiled: 'z.number().finite()', dependencies: ['z'] };

  // numbers can be float or int
  if (value_type === 'int') {
    transformed.compiled = `${transformed.compiled}.int()`;
  }

  // numbers can have min/max values
  if (min !== undefined) {
    transformed.compiled = `${transformed.compiled}.min(${min})`;
  }
  if (max !== undefined) {
    transformed.compiled = `${transformed.compiled}.max(${max})`;
  }

  return transformed;
};
