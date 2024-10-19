import type { CmsFieldBase, CmsFieldCode } from 'decap-cms-core';
import type { ZodObject, ZodString } from 'zod';
import type { Transformer } from '../utils/transform.utils.js';

// https://decapcms.org/docs/widgets/#code
export const transformCodeField: Transformer<
  ZodString | ZodObject<any>,
  CmsFieldBase & CmsFieldCode
> = ({ output_code_only: flat }, z) => ({
  runtime: flat ? z.string() : z.object({ code: z.string(), language: z.string() }),
  cptime: flat ? 'z.string()' : 'z.object({ code: z.string(), language: z.string() })',
});
