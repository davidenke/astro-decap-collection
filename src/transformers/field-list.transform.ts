import type { CmsFieldBase, CmsFieldList } from 'decap-cms-core';
import type { ZodArray, ZodDiscriminatedUnion, ZodLiteral, ZodObject } from 'zod';

import type { Transformer, TransformResult } from '../utils/transform.utils.js';
import { transformObjectField } from './field-object.transform.js';

type ZodListItem = ZodObject<any> & ZodLiteral<string>;

// https://decapcms.org/docs/widgets/#list
export const transformListField: Transformer<
  ZodArray<ZodDiscriminatedUnion<'type', ZodObject<any>[]>>,
  CmsFieldBase & CmsFieldList
> = ({ types = [] }, z) => {
  const items = types.map((type): TransformResult<ZodListItem> => {
    // transform first
    const item = transformObjectField(type, z);
    // extend with type discriminator
    return {
      runtime: (item.runtime as any).extend({ type: z.literal(type.name) }),
      cptime: `${item.cptime}.extend({type: z.literal('${type.name}')})`,
    };
  });
  const runtime = z.array(
    z.discriminatedUnion(
      'type',
      items.map(t => t.runtime) as [ZodListItem, ZodListItem, ...ZodListItem[]],
    ),
  );
  const cptime = `z.array(z.discriminatedUnion('type', [${items.map(t => t.cptime).join(',')}]))`;

  return { runtime, cptime };
};
