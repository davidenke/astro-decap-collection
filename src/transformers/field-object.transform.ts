import type { CmsFieldBase, CmsFieldObject } from 'decap-cms-core';
import type { ZodObject } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';
import { transformField } from './field.transform.js';

// https://decapcms.org/docs/widgets/#object
export const transformObjectField: Transformer<ZodObject<any>, CmsFieldBase & CmsFieldObject> = (
  { fields },
  z,
) => {
  const results = fields.map(field => [field.name, transformField(field, z)] as const);
  const runtime = z.object(Object.fromEntries(results.map(([name, r]) => [name, r.runtime])));
  const cptime = `z.object({${results.map(([name, r]) => `${name}: ${r.cptime}`).join(',')}})`;
  return { runtime, cptime };
};
