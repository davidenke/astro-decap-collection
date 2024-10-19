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
export async function formatCode(
  code: string,
  parser: Prettier.BuiltInParserName = 'typescript',
  target?: string,
): Promise<string> {
  const prettier = await loadPrettier();
  if (prettier === undefined) return code;
  const options = await prettier.resolveConfig(target);
  return prettier.format(code, { ...options, parser });
}
