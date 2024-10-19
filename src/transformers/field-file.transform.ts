import type { CmsFieldBase, CmsFieldStringOrText } from 'decap-cms-core';
import type { ZodString } from 'zod';
import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#file
// https://decapcms.org/docs/widgets/#image
export const transformFileField: Transformer<ZodString, CmsFieldBase & CmsFieldStringOrText> = (
  _,
  z,
) => ({
  runtime: z.string(),
  cptime: 'z.string()',
});
