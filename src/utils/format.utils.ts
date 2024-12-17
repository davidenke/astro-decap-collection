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
  target?: string,
  options?: Prettier.Options,
): Promise<string> {
  const prettier = await loadPrettier();
  if (!prettier) return code;
  const defaults = (target && (await prettier.resolveConfig?.(target))) ?? {};
  const imports = await Promise.all([
    import('prettier/plugins/estree'),
    import('prettier/plugins/typescript'),
  ]);
  const plugins = imports.map(i => i.default);
  return prettier.format(code, { ...defaults, ...options, parser: 'typescript', plugins });
}

// as we do not know about string contents, we need to sanitize them - thus, we
// can safely use single quotes for delimiting strings in the generated code
export function escapeString(input: string): string {
  return input.replace(/'/g, "\\'");
}

// object keys can either be strings or identifiers, the latter
// are more common and can be used without quotes
export function getObjectKey(name: string): string {
  const isIdentifier = /^[a-zA-Z_$][\w$]*$/.test(name);
  return isIdentifier ? name : `['${escapeString(name)}']`;
}
