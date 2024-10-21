import zod from 'zod';

import { parseConfig } from '../utils/decap.utils.js';
import { formatCode } from '../utils/format.utils.js';
import { transformCollection } from '../utils/transform.utils.js';

declare global {
  interface Window {
    global: Window;
    loadExample(path: string): void;
    handleInput(event: InputEvent): Promise<void>;
    updatePreview(config: string, schemas: Record<string, string>): void;
  }
}

window.global ||= window;

// loads an example from the `examples` folder
window.loadExample = async (path: string) => {
  const input = document.querySelector('textarea');
  const example = await fetch(path);
  input.value = await example.text();
  input.dispatchEvent(new InputEvent('input'));
};

window.handleInput = async event => {
  const { value } = event.target as HTMLTextAreaElement;
  const { collections } = await parseConfig(value);
  const schemas = await Promise.all(
    collections.map(async collection => {
      const { cptime } = transformCollection(collection, { zod });
      return [collection.name, await formatCode(cptime)];
    }),
  );
  window.updatePreview(JSON.stringify(collections, null, 2), Object.fromEntries(schemas));
};

window.updatePreview = (config, schemas) => {
  const configPreview = document.querySelector<HTMLElement>('#config > code');
  configPreview.dataset.label = `${Object.entries(schemas).length}`;
  configPreview.innerHTML = config;

  const schemaPreview = document.querySelector('#schema');
  schemaPreview.innerHTML = Object.entries(schemas)
    .map(([name, schema]) => `<code data-label="${name}">${schema}</code>`)
    .join('\n\n');
};
