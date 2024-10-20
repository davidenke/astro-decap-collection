import zod from 'zod';

import { parseConfig } from '../utils/decap.utils.js';
import { formatCode } from '../utils/format.utils.js';
import { transformCollection } from '../utils/transform.utils.js';

declare global {
  interface Window {
    global: Window;
    handleExample(event: MouseEvent): void;
    handleInput(event: InputEvent): Promise<void>;
    updatePreview(config: string, schemas: Record<string, string>): void;
  }
}

window.global ||= window;

window.handleExample = () => {
  const input = document.querySelector('textarea');
  input.value = `collections:
  - name: "blog" # Used in routes, e.g., /admin/collections/blog
    label: "Blog" # Used in the UI
    folder: "packages/website/src/content/blog" # The path to the folder where the documents are stored
    create: true # Allow users to create new documents in this collection
    fields: # The fields for each document, usually in frontmatter
      - { label: "Layout", name: "layout", widget: "hidden", default: "blog" }
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Published", name: "published", widget: "boolean", required: false }
      - { label: 'Color' , name: 'color', widget: 'color', enableAlpha: true }
      - { label: 'Place' , name: 'place', widget: 'map' }
      - { label: "Publish Date", name: "date", widget: "datetime" }
      - { label: "Featured Image(s)", name: "thumbnail", widget: "image" }
      - { label: "Rating (scale of 1-5)", name: "rating", widget: "number", max: 5 }
      - { label: "Code", name: "code", widget: "code", output_code_only: true }
      - { label: "Body", name: "body", widget: "markdown" }
`;
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
