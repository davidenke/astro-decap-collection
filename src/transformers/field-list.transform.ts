import type { CmsFieldBase, CmsFieldList } from 'decap-cms-core';
import type { ZodArray, ZodDiscriminatedUnion, ZodLiteral, ZodObject } from 'zod';

import type { Transformer, TransformResult } from '../utils/transform.utils.js';
import { transformField } from './field.transform.js';
import { transformObjectField } from './field-object.transform.js';

type ZodListItem = ZodObject<any> & ZodLiteral<string>;

// Lists are either spread by a single repeatable field, or by a list of fields.
// Additionally, instead of fields, we can have a list of types.
// https://decapcms.org/docs/widgets/#list
// https://decapcms.org/docs/widgets/#Variable%20Type%20Widgets
export const transformListField: Transformer<
  ZodArray<any | ZodDiscriminatedUnion<'type', ZodObject<any>[]>>,
  CmsFieldBase & CmsFieldList
> = ({ field = {} as CmsFieldBase, fields, types }, z) => {
  // handle type list
  if (Array.isArray(types)) {
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
  }

  // handle fields list
  if (Array.isArray(fields)) {
    const items = transformObjectField({ fields } as any, z);
    const runtime = z.array(items.runtime);
    const cptime = `z.array(${items.cptime})`;
    return { runtime, cptime };
  }

  // handle single field (or never) list
  const item = transformField(field, z);
  const runtime = z.array(item.runtime);
  const cptime = `z.array(${item.cptime})`;
  return { runtime, cptime };
};
