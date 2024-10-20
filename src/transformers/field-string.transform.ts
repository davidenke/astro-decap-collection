import type { CmsFieldBase, CmsFieldColor, CmsFieldStringOrText } from 'decap-cms-core';
import type { ZodString } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#color
// https://decapcms.org/docs/widgets/#markdown
// https://decapcms.org/docs/widgets/#string
// https://decapcms.org/docs/widgets/#text
export const transformStringField: Transformer<
  ZodString,
  CmsFieldBase & (CmsFieldColor | CmsFieldStringOrText)
> = (_, z) => ({
  runtime: z.string(),
  cptime: 'z.string()',
});
