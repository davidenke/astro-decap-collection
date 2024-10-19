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
  const { outputText } = transpileModule(source, tsConfig as unknown as TranspileOptions);
  return outputText;
};

export {};
