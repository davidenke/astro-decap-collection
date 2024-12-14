import type * as Decap from 'decap-cms-core';

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

export const transformField: Transformer = field => {
  const knownWidgets = field.widget as DecapWidgetType;
  const applyTransform = (field: Decap.CmsField, transformer: Transformer<any>): TransformResult =>
    transformer(field);
  let compiled: string;

  switch (knownWidgets) {
    case 'color': // https://decapcms.org/docs/widgets/#color
    case 'markdown': // https://decapcms.org/docs/widgets/#markdown
    case 'string': // https://decapcms.org/docs/widgets/#string
    case 'text': // https://decapcms.org/docs/widgets/#text
      ({ compiled } = applyTransform(field, transformStringField));
      break;

    case 'file': // https://decapcms.org/docs/widgets/#file
    case 'image': // https://decapcms.org/docs/widgets/#image
      ({ compiled } = applyTransform(field, transformFileField));
      break;

    case 'datetime': // https://decapcms.org/docs/widgets/#datetime
      ({ compiled } = applyTransform(field, transformDateTimeField));
      break;

    case 'code': // https://decapcms.org/docs/widgets/#code
      ({ compiled } = applyTransform(field, transformCodeField));
      break;

    case 'hidden': // https://decapcms.org/docs/widgets/#hidden
      ({ compiled } = applyTransform(field, transformHiddenField));
      break;

    case 'map': // https://decapcms.org/docs/widgets/#map
      ({ compiled } = applyTransform(field, transformMapField));
      break;

    case 'relation': // https://decapcms.org/docs/widgets/#relation
      ({ compiled } = applyTransform(field, transformRelationField));
      break;

    case 'number': // https://decapcms.org/docs/widgets/#number
      ({ compiled } = applyTransform(field, transformNumberField));
      break;

    case 'boolean': // https://decapcms.org/docs/widgets/#boolean
      ({ compiled } = applyTransform(field, transformBooleanField));
      break;

    case 'select': // https://decapcms.org/docs/widgets/#select
      ({ compiled } = applyTransform(field, transformSelectField));
      break;

    case 'object': // https://decapcms.org/docs/widgets/#object
      ({ compiled } = applyTransform(field, transformObjectField));
      break;

    case 'list': // https://decapcms.org/docs/widgets/#list
      ({ compiled } = applyTransform(field, transformListField));
      break;

    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (_exhaustiveCheck: never = knownWidgets) => null;
      ({ compiled } = transformNeverField(field));
      break;
  }

  // flag field as optional, set a default value and add a description if available
  ({ compiled } = applyOptional(field, { compiled }));
  ({ compiled } = applyDefaultValue(field, { compiled }));
  ({ compiled } = applyDescription(field, { compiled }));

  return { compiled };
};
