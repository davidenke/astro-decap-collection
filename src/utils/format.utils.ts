// type import should vanish in runtime
import type * as Prettier from 'prettier';

// try to load optional prettier
export async function loadPrettier(): Promise<typeof Prettier | undefined> {
  try {
    return await import('prettier');
  } catch {
    console.warn('Prettier not found. Will write files without formatting.');
    return undefined;
  }
}

// format code using prettier if available
export async function formatCode(code: string, target?: string): Promise<string> {
  const prettier = await loadPrettier();
  if (!prettier) return code;
  const options = (target && (await prettier.resolveConfig?.(target))) ?? {};
  const imports = await Promise.all([
    import('prettier/plugins/estree'),
    import('prettier/plugins/typescript'),
  ]);
  const plugins = imports.map(i => i.default);
  return prettier.format(code, { ...options, parser: 'typescript', plugins });
}
