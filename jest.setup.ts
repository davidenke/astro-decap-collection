import { transpileModule, type TranspileOptions } from 'typescript';
import z from 'zod';

import tsConfig from './tsconfig.json';

declare global {
  function serializeShape(type: z.ZodType<any, any, any>): string;
  function transpileFrom(source: string): string;
}

globalThis.serializeShape = global.serializeShape = function (type) {
  const wrapped = z.strictObject({ type });
  return JSON.stringify(wrapped.shape);
};

globalThis.transpileFrom = global.transpileFrom = function (source) {
  // remove strict mode for inline transpilation, as it would add `use strict` to the output
  const options = { ...tsConfig, compilerOptions: { ...tsConfig.compilerOptions, strict: false } };
  const { outputText } = transpileModule(source, options as unknown as TranspileOptions);
  return outputText;
};

export {};
