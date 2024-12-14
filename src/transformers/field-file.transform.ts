import type { CmsFieldBase, CmsFieldStringOrText } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#file
// https://decapcms.org/docs/widgets/#image
export const transformFileField: Transformer<CmsFieldBase & CmsFieldStringOrText> = () => ({
  compiled: 'z.string()',
  dependencies: ['z'],
});
