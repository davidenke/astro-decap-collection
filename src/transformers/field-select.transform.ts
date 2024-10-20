import type { CmsFieldBase, CmsFieldSelect } from 'decap-cms-core';
import type { ZodEnum } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#select
export const transformSelectField: Transformer<
  ZodEnum<[string, ...string[]]>,
  CmsFieldBase & CmsFieldSelect
> = ({ options }, z) => {
  const items = options.map(option => (typeof option === 'string' ? option : option.value));
  const runtime = z.enum(items as [string, ...string[]]);
  const cptime = `z.enum([${items.map(i => `'${i}'`).join(',')}])`;
  return { runtime, cptime };
};
