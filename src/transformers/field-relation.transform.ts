import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// TODO implement transform relations
// https://decapcms.org/docs/widgets/#relation
export const transformRelationField: Transformer<CmsFieldBase & CmsFieldRelation> = () => ({
  compiled: 'z.string()',
});
