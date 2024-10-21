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
    updatePreview(input: string, config: string, schemas: Record<string, string>): void;
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
  const input = document.querySelector('textarea');
  const example = await fetch(path);
  input.value = await example.text();
  input.dispatchEvent(new InputEvent('input'));
};

// handle textarea input event
window.handleInput = async event => {
  const { value: config } = event.target as HTMLTextAreaElement;
  const { collections } = (await parseConfig(config)) ?? {};
  if (collections === undefined) {
    window.updatePreview(config, '', {});
    return;
  }

  const schemas = await Promise.all(
    collections.map(async collection => {
      const { cptime } = transformCollection(collection, { zod });
      return [collection.name, await formatCode(cptime)];
    }),
  );
  window.updatePreview(config, JSON.stringify(collections, null, 2), Object.fromEntries(schemas));
};

window.handleScroll = event => {
  const { scrollTop, parentElement } = event.target as HTMLTextAreaElement;
  parentElement.firstElementChild.firstElementChild.scrollTop = scrollTop;
};

// update the preview code with the config and schemas
window.updatePreview = (input, config, schemas) => {
  const inputPreview = document.querySelector<HTMLElement>('#input code');
  inputPreview.innerHTML = hljs.highlight(input, { language: 'yaml' }).value;

  const configPreview = document.querySelector<HTMLElement>('#config code');
  configPreview.dataset.label = `count: ${Object.entries(schemas).length}`;
  configPreview.innerHTML = hljs.highlight(config, { language: 'json' }).value;

  const schemaPreview = document.querySelector('#schemas pre');
  schemaPreview.innerHTML = Object.entries(schemas)
    .map(
      ([name, schema]) =>
        `<code data-label="${name}">${hljs.highlight(schema, { language: 'ts' }).value}</code>`,
    )
    .join('\n\n');
};
