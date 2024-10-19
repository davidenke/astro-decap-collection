# Astro Decap Collection

Derive Astro collection schemata from Decap configs.

## Local development

Run a local tsx compiler in watch mode

```bash
npx tsx watch ./src/cli.ts -c ../website/public/admin/config.yml -t ../website/src/content
```

## Validation only (runtime)

This wont get you types, but you can still validate content against the schema.

```typescript
import {
  getCollection,
  loadDecapConfig,
  prepareSchema,
  transformCollection,
} from 'astro-decap-collection';
import { defineCollection, z as zod } from 'astro:content';
import { fileURLToPath } from 'node:url';

// load Decap config and transform it at runtime
const configURL = fileURLToPath(new URL('../../public/admin/config.yml', import.meta.url));
const config = await loadDecapConfig(configURL);
const collection = getCollection(config, 'blog')!;
const schema = await transformCollection(collection, { zod });

export const collections = {
  blog: defineCollection(prepareSchema(schema.runtime)),
};
```

## Types and validation (preferred)

Transform the Decap config at build time and use the generated Zod schema.

```bash
# astrodecap-collection, adc - Binary name
# --config, -c - Decap YML config file path to read from
# --target, -t - Astro content directory path to write to
adc -c ./public/admin/config.yml -t ./src/content
```

```typescript
import { defineCollection } from 'astro:content';
import { prepareSchema } from 'astro-decap-collection'; // wraps schema and adds content type

import { schema as blogSchema } from './config.blog.ts'; // <-- generated from Decap before
import { schema as pageSchema } from './config.pages.ts'; // <-- generated from Decap before

export const collections = {
  blog: defineCollection(prepareSchema(blogSchema)),
  pages: defineCollection(prepareSchema(pageSchema)),
};
```
