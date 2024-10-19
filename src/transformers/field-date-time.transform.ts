import type { CmsFieldBase, CmsFieldDateTime } from 'decap-cms-core';
import type { ZodDate } from 'zod';
import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#datetime
export const transformDateTimeField: Transformer<ZodDate, CmsFieldBase & CmsFieldDateTime> = (
  _,
  z,
) => ({
  // Decap does not store seconds, but we can just articulate 'no milliseconds'
  // https://zod.dev/?id=dates-1
  runtime: z.date(),
  cptime: 'z.date()',
});
