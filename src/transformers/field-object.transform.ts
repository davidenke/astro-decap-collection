import type { CmsFieldBase, CmsFieldObject } from 'decap-cms-core';

import { getObjectKey } from '../utils/format.utils.js';
import type { Transformer } from '../utils/transform.utils.js';
import { transformField } from './field.transform.js';

// https://decapcms.org/docs/widgets/#object
export const transformObjectField: Transformer<CmsFieldBase & CmsFieldObject> = ({
  fields = [],
}) => {
  const results = fields.map(field => [field.name, transformField(field)] as const);
  const compiled = `z.object({${results.map(([name, r]) => `${getObjectKey(name)}: ${r.compiled}`).join(',')}})`;
  const dependencies = ['z', ...results.flatMap(([, { dependencies }]) => dependencies)];
  return { compiled, dependencies };
};
