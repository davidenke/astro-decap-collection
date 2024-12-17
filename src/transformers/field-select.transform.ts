import type { CmsFieldBase, CmsFieldSelect } from 'decap-cms-core';

import { escapeString } from '../utils/format.utils.js';
import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#select
export const transformSelectField: Transformer<CmsFieldBase & CmsFieldSelect> = ({ options }) => {
  const items = options.map(option => (typeof option === 'string' ? option : option.value));
  return {
    compiled: `z.enum([${items.map(i => `'${escapeString(i)}'`).join(',')}])`,
    dependencies: ['z'],
  };
};
