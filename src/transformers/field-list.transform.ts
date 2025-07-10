import type { CmsFieldBase, CmsFieldList } from 'decap-cms-core';

import type { Transformer, TransformResult } from '../utils/transform.utils.js';
import { transformField } from './field.transform.js';
import { transformObjectField } from './field-object.transform.js';

// Lists are either spread by a single repeatable field, or by a list of fields.
// Additionally, instead of fields, we can have a list of types.
// https://decapcms.org/docs/widgets/#list
// https://decapcms.org/docs/widgets/#Variable%20Type%20Widgets
export const transformListField: Transformer<CmsFieldBase & CmsFieldList> = ({
  field = {} as CmsFieldBase,
  fields,
  types,
}) => {
  // handle type list
  if (Array.isArray(types)) {
    const items = types.map((type): TransformResult => {
      // transform first
      const item = transformObjectField(type);
      // extend with type discriminator
      return {
        compiled: `${item.compiled}.extend({type: z.literal('${type.name}')})`,
        dependencies: ['z', ...item.dependencies],
      };
    });
    return {
      compiled: `z.array(z.discriminatedUnion('type', [${items.map(t => t.compiled).join(',')}]))`,
      dependencies: ['z', ...items.flatMap(({ dependencies }) => dependencies)],
    };
  }

  // handle fields list
  if (Array.isArray(fields)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = transformObjectField({ fields } as any);
    return { compiled: `z.array(${items.compiled})`, dependencies: ['z', ...items.dependencies] };
  }

  // handle single field (or never) list
  const item = transformField(field);
  return { compiled: `z.array(${item.compiled})`, dependencies: ['z', ...item.dependencies] };
};
