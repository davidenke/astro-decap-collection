/**
 * Decompress a binary string representation with browser native APIs in to a normal js string
 *
 * @param binary - Binary string that should be decompressed, e.g. the output from `atob`
 * @param encoding - Decompression algorithm to use
 * @returns The decompressed string
 */
export async function decompressRaw(binary: string, encoding: CompressionFormat): Promise<string> {
  // stream the string through the decompressor
  const stream = new Blob([Uint8Array.from(binary, m => m.codePointAt(0) ?? 0)])
    .stream()
    .pipeThrough(new DecompressionStream(encoding));
  // convert the stream to a string
  return new Response(stream).text();
}

/**
 * Decompress a string representation with browser native APIs in to a normal js string
 *
 * @param data - String that should be decompressed
 * @param encoding - Decompression algorithm to use
 * @returns The decompressed string
 */
export async function decompress(data: string, encoding: CompressionFormat): Promise<string> {
  return decompressRaw(atob(data), encoding);
}
