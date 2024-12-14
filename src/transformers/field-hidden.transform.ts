import type { CmsFieldBase, CmsFieldHidden } from 'decap-cms-core';

import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#hidden
export const transformHiddenField: Transformer<CmsFieldBase & CmsFieldHidden> = () => ({
  compiled: `z.lazy(() => {
    const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
    type Literal = Zod.infer<typeof literal>;
    type Json = Literal | { [key: string]: Json } | Json[];
    const json: Zod.ZodType<Json> = z.lazy(() => z.union([literal, z.array(json), z.record(json)]));
    return json;
  })`,
  dependencies: ['z'],
  // This @jsdoc version was meant to make tests working, as the cptime string has simply been eval'd.
  // That might be helpful (or not) later. For now, we compile the cptime string first and then eval it.
  // cptime: `z.lazy(() => {
  //   const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
  //   /** @typedef {typeof import('zod')} Zod */
  //   /** @typedef {Zod.infer<typeof literal>} Literal */
  //   /** @typedef {Literal | { [key: string]: Json } | Json[]} Json */
  //   /** @constant {Zod.ZodType<Json>} */
  //   const json = z.lazy(() => z.union([literal, z.array(json), z.record(json)]));
  //   return json;
  // })`,
});
