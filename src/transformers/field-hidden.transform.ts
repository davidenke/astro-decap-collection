import type { CmsFieldBase, CmsFieldHidden } from 'decap-cms-core';
import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#hidden
// TODO could this be moved into a custom schema? → https://zod.dev/?id=custom-schemas
export const transformHiddenField: Transformer<Zod.ZodType, CmsFieldBase & CmsFieldHidden> = (
  _,
  z,
) => ({
  runtime: z.lazy(() => {
    // https://zod.dev/?id=json-type
    const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
    type Literal = Zod.infer<typeof literal>;
    type Json = Literal | { [key: string]: Json } | Json[];
    const json: Zod.ZodType<Json> = z.lazy(() => z.union([literal, z.array(json), z.record(json)]));
    return json;
  }),
  cptime: `z.lazy(() => {
    const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
    type Literal = Zod.infer<typeof literal>;
    type Json = Literal | { [key: string]: Json } | Json[];
    const json: Zod.ZodType<Json> = z.lazy(() => z.union([literal, z.array(json), z.record(json)]));
    return json;
  })`,
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
