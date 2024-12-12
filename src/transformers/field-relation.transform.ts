import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';
import type { ZodTypeAny } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

export const transformRelationField: Transformer<ZodTypeAny, CmsFieldBase & CmsFieldRelation> = (
  { collection, multiple = false, required = true },
  z,
) => {
  const base = multiple ? z.array(z.string()) : z.string();
  const runtime = required ? base : base.optional();

  const cptime = multiple ? `z.array(reference('${collection}'))` : `reference('${collection}')`;

  return { runtime, cptime };
};
