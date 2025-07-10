import type * as Decap from 'decap-cms-core';

import type { DecapWidgetType } from '../utils/decap.utils.js';
import type { Transformer, TransformResult } from '../utils/transform.utils.js';
import { applyDefaultValue, applyDescription, applyOptional } from '../utils/transform.utils.js';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyTransform = (field: Decap.CmsField, transformer: Transformer<any>): TransformResult =>
    transformer(field);
  let result: TransformResult;

  switch (knownWidgets) {
    case 'color': // https://decapcms.org/docs/widgets/#color
    case 'markdown': // https://decapcms.org/docs/widgets/#markdown
    case 'string': // https://decapcms.org/docs/widgets/#string
    case 'text': // https://decapcms.org/docs/widgets/#text
      result = applyTransform(field, transformStringField);
      break;

    case 'file': // https://decapcms.org/docs/widgets/#file
    case 'image': // https://decapcms.org/docs/widgets/#image
      result = applyTransform(field, transformFileField);
      break;

    case 'datetime': // https://decapcms.org/docs/widgets/#datetime
      result = applyTransform(field, transformDateTimeField);
      break;

    case 'code': // https://decapcms.org/docs/widgets/#code
      result = applyTransform(field, transformCodeField);
      break;

    case 'hidden': // https://decapcms.org/docs/widgets/#hidden
      result = applyTransform(field, transformHiddenField);
      break;

    case 'map': // https://decapcms.org/docs/widgets/#map
      result = applyTransform(field, transformMapField);
      break;

    case 'relation': // https://decapcms.org/docs/widgets/#relation
      result = applyTransform(field, transformRelationField);
      break;

    case 'number': // https://decapcms.org/docs/widgets/#number
      result = applyTransform(field, transformNumberField);
      break;

    case 'boolean': // https://decapcms.org/docs/widgets/#boolean
      result = applyTransform(field, transformBooleanField);
      break;

    case 'select': // https://decapcms.org/docs/widgets/#select
      result = applyTransform(field, transformSelectField);
      break;

    case 'object': // https://decapcms.org/docs/widgets/#object
      result = applyTransform(field, transformObjectField);
      break;

    case 'list': // https://decapcms.org/docs/widgets/#list
      result = applyTransform(field, transformListField);
      break;

    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (_exhaustiveCheck: never = knownWidgets) => null;
      result = transformNeverField(field);
      break;
  }

  // flag field as optional, set a default value and add a description if available
  result = applyOptional(field, result);
  result = applyDefaultValue(field, result);
  result = applyDescription(field, result);

  return result;
};
