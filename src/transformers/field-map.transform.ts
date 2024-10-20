import type { CmsFieldBase, CmsFieldMap } from 'decap-cms-core';
import type { ZodString } from 'zod';

import type { Transformer } from '../utils/transform.utils.js';

// TODO handle the parsed result of '{"type":"Point","coordinates":[13.74717,51.0544007]}'
// → https://zod.dev/?id=custom-schemas
// runtime = z.object({
//   type: z.literal('Point'),
//   coordinates: z.tuple([z.number(), z.number()]),
// });
// → https://zod.dev/?id=refine
// https://decapcms.org/docs/widgets/#map
export const transformMapField: Transformer<ZodString, CmsFieldBase & CmsFieldMap> = (_, z) => ({
  runtime: z.string(),
  cptime: 'z.string()',
});
