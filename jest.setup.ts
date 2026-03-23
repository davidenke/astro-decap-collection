import type { TranspileOptions } from 'typescript';
import { transpileModule } from 'typescript';
import z from 'zod';

import tsConfig from './tsconfig.json';

declare global {
  function parseShape<T extends z.ZodType = z.ZodType>(
    shape: string,
    deps?: Record<string, unknown>
  ): T;
  function serializeShape(type: z.ZodType): string;
}

globalThis.parseShape = global.parseShape = function (shape, deps = {}) {
  // remove strict mode for inline transpilation, as it would add `use strict` to the output
  const options = { ...tsConfig, compilerOptions: { ...tsConfig.compilerOptions, strict: false } };
  const { outputText } = transpileModule(shape, options as unknown as TranspileOptions);
  // TypeScript 6 always emits "use strict"; — strip it so the return statement works
  const code = outputText.replace(/^"use strict";\n?/, '');
  // evaluate adding zod to the scope
  return new Function(...Object.keys(deps), `return ${code};`)(...Object.values(deps));
};

globalThis.serializeShape = global.serializeShape = function (type) {
  const wrapped = z.strictObject({ type });
  return JSON.stringify(wrapped.shape);
};

export {};
