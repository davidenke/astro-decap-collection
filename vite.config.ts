import { defineConfig } from 'vite';
// import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Vite configuration
// https://vitejs.dev/config/
export default defineConfig(async () => ({
  // ensure relative asset paths in index.html file
  base: './',
  plugins: [
    // add type check directly to vite
    // checker({ typescript: true, overlay: false }),
    // polyfill `node:events` as used by `xmind-model`
    nodePolyfills(),
  ],
  // https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/25#issuecomment-1962228168
  resolve: { alias: { 'node:fs/promises': 'node-stdlib-browser/mock/empty' } },
}));
