import type { CmsFieldBase, CmsFieldDateTime } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#datetime
export const transformDateTimeField: Transformer<CmsFieldBase & CmsFieldDateTime> = () => ({
  // Decap does not store seconds, but we can just articulate 'no milliseconds'
  // https://zod.dev/?id=dates-1
  compiled: 'z.date()',
  dependencies: ['z'],
});
