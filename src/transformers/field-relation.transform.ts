import type { CmsFieldBase, CmsFieldRelation } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

export const transformRelationField: Transformer<CmsFieldBase & CmsFieldRelation> = ({
  collection,
  multiple = false,
}) => {
  return {
    compiled: multiple ? `z.array(reference('${collection}'))` : `reference('${collection}')`,
    dependencies: ['z', 'reference'],
  };
};
