import type { CmsFieldBase, CmsFieldSelect } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#select
export const transformSelectField: Transformer<CmsFieldBase & CmsFieldSelect> = ({ options }) => {
  const items = options.map(option => (typeof option === 'string' ? option : option.value));
  return {
    compiled: `z.enum([${items.map(i => `'${i}'`).join(',')}])`,
    dependencies: ['z'],
  };
};
