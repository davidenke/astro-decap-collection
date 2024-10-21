/**
 * Compress a string with browser native APIs into a binary string representation
 *
 * @param data - Input string that should be compressed
 * @param encoding - Compression algorithm to use
 * @returns The compressed binary string
 */
export async function compressRaw(data: string, encoding: CompressionFormat): Promise<string> {
  // stream the string through the compressor
  const stream = new Blob([new TextEncoder().encode(data)])
    .stream()
    .pipeThrough(new CompressionStream(encoding));
  // convert the stream to an array buffer
  const buffer = await new Response(stream).arrayBuffer();
  // convert the array buffer to a binary string
  return Array.from(new Uint8Array(buffer), x => String.fromCodePoint(x)).join('');
}

/**
 * Compress a string with browser native APIs into a string representation
 *
 * @param data - Input string that should be compressed
 * @param encoding - Compression algorithm to use
 * @returns The compressed string
 */
export async function compress(data: string, encoding: CompressionFormat): Promise<string> {
  return btoa(await compressRaw(data, encoding));
}
