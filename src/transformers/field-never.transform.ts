import type { CmsFieldBase } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

export const transformNeverField: Transformer<CmsFieldBase> = () => ({
  compiled: 'z.never()',
  dependencies: ['z'],
});
