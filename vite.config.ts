import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export function htmlInlineSvg(): Plugin {
  return {
    name: 'html-inline-svg',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { filename }) {
        return html.replaceAll(/<img src="(.+\.svg)"(.*?)\/?>/g, (_, src) => {
          const path = resolve(dirname(filename), src);
          return readFileSync(path, 'utf-8');
        });
      },
    },
  };
}

// Vite configuration
// https://vitejs.dev/config/
export default defineConfig(async () => ({
  // ensure relative asset paths in index.html file
  base: './',
  plugins: [
    // add type check directly to vite
    checker({ typescript: true, overlay: false }),
    // polyfill `node:events` as used by `xmind-model`
    nodePolyfills(),
    // inline svg files referenced in html files
    htmlInlineSvg(),
  ],
  // https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/25#issuecomment-1962228168
  resolve: { alias: { 'node:fs/promises': 'node-stdlib-browser/mock/empty' } },
  // defined available examples
  define: {
    __EXAMPLES__: JSON.stringify(
      readdirSync('public/examples').map(file => ({
        href: `examples/${file}`,
        name: file.replace(/\.yml$/, ''),
      })),
    ),
  },
}));
