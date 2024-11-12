import type * as Decap from 'decap-cms-core';
import type * as Zod from 'zod';

import type { DecapWidgetType } from '../utils/decap.utils.js';
import {
  applyDefaultValue,
  applyDescription,
  applyOptional,
  type Transformer,
  type TransformResult,
} from '../utils/transform.utils.js';
import { transformBooleanField } from './field-boolean.transform.js';
import { transformCodeField } from './field-code.transform.js';
import { transformDateTimeField } from './field-date-time.transform.js';
import { transformFileField } from './field-file.transform.js';
import { transformHiddenField } from './field-hidden.transform.js';
import { transformListField } from './field-list.transform.js';
import { transformMapField } from './field-map.transform.js';
import { transformNeverField } from './field-never.transform.js';
import { transformNumberField } from './field-number.transform.js';
import { transformObjectField } from './field-object.transform.js';
import { transformRelationField } from './field-relation.transform.js';
import { transformSelectField } from './field-select.transform.js';
import { transformStringField } from './field-string.transform.js';

export const transformField: Transformer = (field, z) => {
  const knownWidgets = field.widget as DecapWidgetType;
  const applyTransform = (
    field: Decap.CmsField,
    transformer: Transformer<any, any>,
    z: typeof Zod,
  ): TransformResult => transformer(field, z);

  let runtime: Zod.ZodType;
  let cptime: string;

  switch (knownWidgets) {
    case 'color': // https://decapcms.org/docs/widgets/#color
    case 'markdown': // https://decapcms.org/docs/widgets/#markdown
    case 'string': // https://decapcms.org/docs/widgets/#string
    case 'text': // https://decapcms.org/docs/widgets/#text
      ({ runtime, cptime } = applyTransform(field, transformStringField, z));
      break;

    case 'file': // https://decapcms.org/docs/widgets/#file
    case 'image': // https://decapcms.org/docs/widgets/#image
      ({ runtime, cptime } = applyTransform(field, transformFileField, z));
      break;

    case 'datetime': // https://decapcms.org/docs/widgets/#datetime
      ({ runtime, cptime } = applyTransform(field, transformDateTimeField, z));
      break;

    case 'code': // https://decapcms.org/docs/widgets/#code
      ({ runtime, cptime } = applyTransform(field, transformCodeField, z));
      break;

    case 'hidden': // https://decapcms.org/docs/widgets/#hidden
      ({ runtime, cptime } = applyTransform(field, transformHiddenField, z));
      break;

    case 'map': // https://decapcms.org/docs/widgets/#map
      ({ runtime, cptime } = applyTransform(field, transformMapField, z));
      break;

    case 'relation': // https://decapcms.org/docs/widgets/#relation
      ({ runtime, cptime } = applyTransform(field, transformRelationField, z));
      break;

    case 'number': // https://decapcms.org/docs/widgets/#number
      ({ runtime, cptime } = applyTransform(field, transformNumberField, z));
      break;

    case 'boolean': // https://decapcms.org/docs/widgets/#boolean
      ({ runtime, cptime } = applyTransform(field, transformBooleanField, z));
      break;

    case 'select': // https://decapcms.org/docs/widgets/#select
      ({ runtime, cptime } = applyTransform(field, transformSelectField, z));
      break;

    case 'object': // https://decapcms.org/docs/widgets/#object
      ({ runtime, cptime } = applyTransform(field, transformObjectField, z));
      break;

    case 'list': // https://decapcms.org/docs/widgets/#list
      ({ runtime, cptime } = applyTransform(field, transformListField, z));
      break;

    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (_exhaustiveCheck: never = knownWidgets) => null;
      ({ runtime, cptime } = transformNeverField(field, z));
      break;
  }

  // flag field as optional, set a default value and add a description if available
  ({ cptime, runtime } = applyOptional(field, { cptime, runtime }));
  ({ cptime, runtime } = applyDefaultValue(field, { cptime, runtime }));
  ({ cptime, runtime } = applyDescription(field, { cptime, runtime }));

  return { runtime, cptime };
};
