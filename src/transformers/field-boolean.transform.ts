import type { CmsFieldBase, CmsFieldBoolean } from 'decap-cms-core';
import type { ZodBoolean } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#boolean
export const transformBooleanField: Transformer<ZodBoolean, CmsFieldBase & CmsFieldBoolean> = (
  _,
  z,
) => ({
  runtime: z.boolean(),
  cptime: 'z.boolean()',
});
