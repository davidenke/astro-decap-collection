import type { CmsFieldBase, CmsFieldBoolean } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#boolean
export const transformBooleanField: Transformer<CmsFieldBase & CmsFieldBoolean> = () => ({
  compiled: 'z.boolean()',
});
