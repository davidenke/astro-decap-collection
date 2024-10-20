import type { CmsFieldBase } from 'decap-cms-core';
import type { ZodNever } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

export const transformNeverField: Transformer<ZodNever, CmsFieldBase> = (_, z) => ({
  runtime: z.never(),
  cptime: 'z.never()',
});
