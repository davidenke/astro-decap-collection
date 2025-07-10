/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any, @typescript-eslint/no-dynamic-delete */
import type {
  CmsCollection,
  CmsConfig,
  CmsField,
  CmsFieldList,
  CmsFieldObject,
} from 'decap-cms-core';
import * as yaml from 'yaml';

// TODO use the CmsField['widget'] type from decap-cms-core but exclude the generic string somehow
export type DecapWidgetType =
  | 'boolean'
  | 'code'
  | 'color'
  | 'datetime'
  | 'file'
  | 'hidden'
  | 'image'
  | 'list'
  | 'map'
  | 'markdown'
  | 'number'
  | 'object'
  | 'relation'
  | 'select'
  | 'string'
  | 'text';

// taken from decap config utils -
// previously imported at runtime from `decap-cms-core/dist/esm/actions/config.js`, which was, quite obviously,
// not very stable and broke during the last update, thus, this now is ported here from decap-cms-core 3.7.1
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace DecapConfigUtils {
  const WIDGET_KEY_MAP = {
    dateFormat: 'date_format',
    timeFormat: 'time_format',
    pickerUtc: 'picker_utc',
    editorComponents: 'editor_components',
    valueType: 'value_type',
    valueField: 'value_field',
    searchFields: 'search_fields',
    displayFields: 'display_fields',
    optionsLength: 'options_length',
  } as const;

  function setSnakeCaseConfig(field: CmsField): CmsField {
    const deprecatedKeys = Object.keys(WIDGET_KEY_MAP).filter(
      camel => camel in field,
    ) as (keyof typeof WIDGET_KEY_MAP)[];
    const snakeValues = deprecatedKeys.map(camel => {
      const snake = WIDGET_KEY_MAP[camel];
      console.warn(
        `Field ${field.name} is using a deprecated configuration '${camel}'. Please use '${snake}'`,
      );
      return { [snake]: field[camel as keyof CmsField] };
    });
    return Object.assign({}, field, ...snakeValues);
  }

  function isObjectField(field: object): field is CmsFieldObject {
    return 'fields' in field;
  }

  function isFieldList(field: object): field is CmsFieldList {
    return 'types' in field || 'field' in field;
  }

  function traverseFieldsJS(
    fields: CmsField[],
    updater: (field: CmsField) => CmsField,
  ): CmsField[] {
    return fields.map(field => {
      const newField = updater(field);
      if (isObjectField(newField)) {
        return { ...newField, fields: traverseFieldsJS(newField.fields, updater) };
      } else if (isFieldList(newField) && newField.field) {
        return { ...newField, field: traverseFieldsJS([newField.field], updater)[0] };
      } else if (isFieldList(newField) && newField.types) {
        return { ...newField, types: traverseFieldsJS(newField.types, updater) };
      }
      return newField;
    }) as CmsField[];
  }

  export function normalizeConfig(config: CmsConfig): CmsConfig {
    const { collections = [] } = config;
    const normalizedCollections = collections.map(collection => {
      const { fields, files } = collection;
      let normalizedCollection = collection;
      if (fields) {
        const normalizedFields = traverseFieldsJS(fields, setSnakeCaseConfig);
        normalizedCollection = { ...normalizedCollection, fields: normalizedFields };
      }
      if (files) {
        const normalizedFiles = files.map(file => {
          const normalizedFileFields = traverseFieldsJS(file.fields, setSnakeCaseConfig);
          return { ...file, fields: normalizedFileFields };
        });
        normalizedCollection = { ...normalizedCollection, files: normalizedFiles };
      }
      if (normalizedCollection.sortableFields) {
        const { sortableFields, ...rest } = normalizedCollection;
        normalizedCollection = { ...rest, sortable_fields: sortableFields };
        console.warn(
          `Collection ${collection.name} is using a deprecated configuration 'sortableFields'. Please use 'sortable_fields'`,
        );
      }
      return normalizedCollection;
    });
    return { ...config, collections: normalizedCollections };
  }

  export function parseConfig(data: string): CmsConfig {
    const config = yaml.parse(data, { maxAliasCount: -1, prettyErrors: true, merge: true });
    if (
      typeof window !== 'undefined' &&
      'CMS_ENV' in window &&
      typeof window.CMS_ENV === 'string' &&
      config[window.CMS_ENV]
    ) {
      const configKeys = Object.keys(config[window.CMS_ENV]);
      for (const key of configKeys) {
        config[key] = config[window.CMS_ENV][key];
      }
    }
    return config;
  }
}

export async function loadDecapConfig(ymlPath: string): Promise<CmsConfig | undefined> {
  const { existsSync } = await import('node:fs');
  const { readFile } = await import('node:fs/promises');

  // does the config file exist?
  if (!existsSync(ymlPath)) {
    return Promise.reject(new Error(`File not found: ${ymlPath}`));
  }

  // ... and use it to process the config file
  const configRaw = await readFile(ymlPath, 'utf8');
  return parseConfig(configRaw);
}

export async function parseConfig(ymlData: string): Promise<CmsConfig | undefined> {
  // in order to use the config utils from Decap CMS in Node,
  // we need to mock some globals first
  if (!('window' in globalThis)) {
    (globalThis as any).__store = {};
    (globalThis as any).localStorage = {
      getItem: (k: string): string => (globalThis as any).__store[k],
      setItem: (k: string, v: string) => ((globalThis as any).__store[k] = v),
      removeItem: (k: string) => delete (globalThis as any).__store[k],
    };
    (globalThis as any).window = {
      document: { createElement: () => ({}) },
      navigator: { userAgent: 'Node.js' },
      history: { pushState: () => {}, replaceState: () => {} },
      location: { href: 'http://localhost', replace: () => {} },
      URL: { createObjectURL: URL.createObjectURL } as any,
    };
  }

  // load the original tooling...
  // let decapConfig = await import('decap-cms-core/dist/esm/actions/config.js');
  // if ('default' in decapConfig) decapConfig = decapConfig.default as any;

  try {
    return DecapConfigUtils.normalizeConfig(DecapConfigUtils.parseConfig(ymlData));
  } catch (error) {
    console.warn('Problems parsing Decap CMS config:', error);
    return undefined;
  }
}

export function getCollection(config: CmsConfig, name: string): CmsCollection | undefined {
  return config.collections.find(collection => collection.name === name);
}
