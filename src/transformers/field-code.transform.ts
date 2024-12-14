import type { CmsFieldBase, CmsFieldCode } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#code
export const transformCodeField: Transformer<CmsFieldBase & CmsFieldCode> = ({
  output_code_only: flat,
}) => ({
  compiled: flat ? 'z.string()' : 'z.object({ code: z.string(), language: z.string() })',
  dependencies: ['z'],
});
