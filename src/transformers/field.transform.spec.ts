import * as z from 'zod';
import * as Decap from 'decap-cms-core';
import { transformField } from './field.transform.js';

const transformers = {
  ...(await import('./field-boolean.transform.js')),
  ...(await import('./field-code.transform.js')),
  ...(await import('./field-date-time.transform.js')),
  ...(await import('./field-file.transform.js')),
  ...(await import('./field-hidden.transform.js')),
  ...(await import('./field-list.transform.js')),
  ...(await import('./field-map.transform.js')),
  ...(await import('./field-never.transform.js')),
  ...(await import('./field-number.transform.js')),
  ...(await import('./field-object.transform.js')),
  ...(await import('./field-relation.transform.js')),
  ...(await import('./field-select.transform.js')),
  ...(await import('./field-string.transform.js')),
};

describe('field.transform', () => {
  describe('transformField', () => {
    let field: Decap.CmsFieldBase & Decap.CmsFieldStringOrText;

    beforeEach(() => {
      field = { name: 'foo', widget: 'text' };
    });

    it('delivers a transform result', () => {
      expect(transformField(field, z)).toHaveProperty('runtime');
      expect(transformField(field, z)).toHaveProperty('cptime');
    });

    it('exposes a runtime Zod object', () => {
      expect(transformField(field, z).runtime).toBeInstanceOf(z.ZodString);
    });

    it('adds a description', () => {
      // from hint, label or name
    });

    it('can be optional', () => {
      // fttb 'nullish' → `null` or `undefined`
    });

    it('can have a default value', () => {});
  });

  describe.each`
    transform                   | widget        | runtype         | extras                          | desc
    ${'transformBooleanField'}  | ${'boolean'}  | ${z.ZodBoolean} | ${{}}                           | ${''}
    ${'transformCodeField'}     | ${'code'}     | ${z.ZodObject}  | ${{ output_code_only: false }}  | ${'as object'}
    ${'transformCodeField'}     | ${'code'}     | ${z.ZodString}  | ${{ output_code_only: true }}   | ${'as string'}
    ${'transformDateTimeField'} | ${'datetime'} | ${z.ZodDate}    | ${{}}                           | ${''}
    ${'transformFileField'}     | ${'file'}     | ${z.ZodString}  | ${{}}                           | ${'for file widget'}
    ${'transformFileField'}     | ${'image'}    | ${z.ZodString}  | ${{}}                           | ${'for image widget'}
    ${'transformHiddenField'}   | ${'hidden'}   | ${z.ZodLazy}    | ${{}}                           | ${''}
    ${'transformListField'}     | ${'list'}     | ${z.ZodArray}   | ${{ types: [] }}                | ${''}
    ${'transformMapField'}      | ${'map'}      | ${z.ZodString}  | ${{}}                           | ${''}
    ${'transformNeverField'}    | ${undefined}  | ${z.ZodNever}   | ${{}}                           | ${''}
    ${'transformNumberField'}   | ${'number'}   | ${z.ZodNumber}  | ${{}}                           | ${''}
    ${'transformRelationField'} | ${'relation'} | ${z.ZodString}  | ${{}}                           | ${''}
    ${'transformObjectField'}   | ${'object'}   | ${z.ZodObject}  | ${{ fields: [] }}               | ${''}
    ${'transformSelectField'}   | ${'select'}   | ${z.ZodEnum}    | ${{ options: ['a', 'b', 'c'] }} | ${''}
    ${'transformStringField'}   | ${'color'}    | ${z.ZodString}  | ${{}}                           | ${'for color widget'}
    ${'transformStringField'}   | ${'file'}     | ${z.ZodString}  | ${{}}                           | ${'for file widget'}
    ${'transformStringField'}   | ${'image'}    | ${z.ZodString}  | ${{}}                           | ${'for image widget'}
    ${'transformStringField'}   | ${'markdown'} | ${z.ZodString}  | ${{}}                           | ${'for markdown widget'}
    ${'transformStringField'}   | ${'string'}   | ${z.ZodString}  | ${{}}                           | ${'for string widget'}
    ${'transformStringField'}   | ${'text'}     | ${z.ZodString}  | ${{}}                           | ${'for text widget'}
  `('$transform $descr', ({ desc, transform: fn, extras, runtype, widget }) => {
    const transform = transformers[fn];
    let field: Decap.CmsField;

    beforeEach(() => {
      field = { name: 'foo', widget, ...extras };
    });

    it(`delivers a transform result ${desc}`, () => {
      expect(transform(field, z)).toHaveProperty('runtime');
      expect(transform(field, z)).toHaveProperty('cptime');
    });

    it(`interchangeable results ${desc}`, () => {
      const { cptime, runtime } = transform(field, z);
      const compiled = new Function('z', `return ${transpileFrom(cptime)};`)(z);
      expect(serializeShape(compiled)).toEqual(serializeShape(runtime));
    });

    it(`exposes a runtime Zod object ${desc}`, () => {
      expect(transform(field, z).runtime).toBeInstanceOf(runtype);
    });
  });
});
