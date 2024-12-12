import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';
import type { ZodTypeAny } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

export const transformRelationField: Transformer<ZodTypeAny, CmsFieldBase & CmsFieldRelation> = (
  { collection, multiple = false },
  z,
) => {
  const runtime = multiple ? z.array(z.string()) : z.string();

  const cptime = multiple ? `z.array(reference('${collection}'))` : `reference('${collection}')`;

  return { runtime, cptime };
};
