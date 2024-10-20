import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';
import type { ZodString } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

// TODO implement transform relations
// https://decapcms.org/docs/widgets/#relation
export const transformRelationField: Transformer<ZodString, CmsFieldBase & CmsFieldRelation> = (
  _,
  z,
) => ({
  runtime: z.string(),
  cptime: 'z.string()',
});
