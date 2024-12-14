import type { CmsFieldBase, CmsFieldObject } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';
import { transformField } from './field.transform.js';

// https://decapcms.org/docs/widgets/#object
export const transformObjectField: Transformer<CmsFieldBase & CmsFieldObject> = ({
  fields = [],
}) => {
  const results = fields.map(field => [field.name, transformField(field)] as const);
  const compiled = `z.object({${results.map(([name, r]) => `${name}: ${r.compiled}`).join(',')}})`;
  return { compiled };
};
