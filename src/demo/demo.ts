import hljs from 'highlight.js';
import json from 'highlight.js/lib/languages/json';
import ts from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';
import zod from 'zod';

import { parseConfig } from '../utils/decap.utils.js';
import { formatCode } from '../utils/format.utils.js';
import { transformCollection } from '../utils/transform.utils.js';

declare global {
  interface Window {
    global: Window;
    loadExample(path: string): void;
    handleInput(event: InputEvent): Promise<void>;
    handleScroll(event: Event): void;
    updateInput(from: InputEvent): string;
    updatePreview(config: string, schemas: Record<string, string>): void;
    clearPreview(): void;
  }
}

// register highlight languages
hljs.registerLanguage('ts', ts);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);

// prevent errors from libs using ancient `global` instead of `globalThis`
window.global ||= window;

// loads an example from the `examples` folder
window.loadExample = async (path: string) => {
  const input = document.querySelector('textarea')!;
  const example = await fetch(path);
  input.value = await example.text();
  input.dispatchEvent(new InputEvent('input'));
};

// handle textarea input event
window.handleInput = async event => {
  const config = window.updateInput(event);
  const { collections = [] } = (await parseConfig(config)) ?? {};
  if (!collections.length) return window.clearPreview();

  const schemas = await Promise.all(
    collections.map(async collection => {
      const { cptime } = transformCollection(collection, { zod });
      return [collection.name, await formatCode(cptime)];
    }),
  );
  window.updatePreview(JSON.stringify(collections, null, 2), Object.fromEntries(schemas));
};

window.handleScroll = event => {
  const { scrollLeft, scrollTop, parentElement } = event.target as HTMLTextAreaElement;
  parentElement?.firstElementChild?.scrollTo(scrollLeft, scrollTop);
};

window.updateInput = event => {
  const input = event.target as HTMLTextAreaElement;
  const preview = document.querySelector<HTMLElement>('#input code')!;
  preview.innerHTML = hljs.highlight(input.value, { language: 'yaml' }).value;
  preview.style.height = `${input.scrollHeight}px`;
  preview.style.width = `${input.scrollWidth}px`;
  window.handleScroll(event);
  return input.value;
};

// update the preview code with the config and schemas
window.updatePreview = (config, schemas) => {
  const configPreview = document.querySelector<HTMLElement>('#config code')!;
  configPreview.parentElement!.dataset.label = `count: ${Object.entries(schemas).length}`;
  configPreview.innerHTML = hljs.highlight(config, { language: 'json' }).value;

  const schemaPreview = document.querySelector('#schemas pre')!;
  schemaPreview.innerHTML = Object.entries(schemas)
    .map(
      ([name, schema]) =>
        `<div data-label="${name}"><code>${hljs.highlight(schema, { language: 'ts' }).value}</code></div>`,
    )
    .join('\n\n');
};

// clear the code previews
window.clearPreview = () => {
  const configPreview = document.querySelector<HTMLElement>('#config code')!;
  delete configPreview.parentElement!.dataset.label;
  configPreview.innerHTML = '';

  const schemaPreview = document.querySelector('#schemas pre')!;
  schemaPreview.innerHTML = '<div><code></code></div>';
};
