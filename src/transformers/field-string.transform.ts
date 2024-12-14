import type { CmsFieldBase, CmsFieldColor, CmsFieldStringOrText } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#color
// https://decapcms.org/docs/widgets/#markdown
// https://decapcms.org/docs/widgets/#string
// https://decapcms.org/docs/widgets/#text
export const transformStringField: Transformer<
  CmsFieldBase & (CmsFieldColor | CmsFieldStringOrText)
> = () => ({ compiled: 'z.string()' });
