import { transpileModule, type TranspileOptions } from 'typescript';
import z from 'zod';

import tsConfig from './tsconfig.json';

declare global {
  function parseShape(shape: string): z.ZodType<any, any, any>;
  function serializeShape(type: z.ZodType<any, any, any>): string;
}

globalThis.parseShape = global.parseShape = function (shape) {
  // remove strict mode for inline transpilation, as it would add `use strict` to the output
  const options = { ...tsConfig, compilerOptions: { ...tsConfig.compilerOptions, strict: false } };
  const { outputText } = transpileModule(shape, options as unknown as TranspileOptions);
  // evaluate adding zod to the scope
  return new Function('z', `return ${outputText};`)(z);
};

globalThis.serializeShape = global.serializeShape = function (type) {
  const wrapped = z.strictObject({ type });
  return JSON.stringify(wrapped.shape);
};

export {};
