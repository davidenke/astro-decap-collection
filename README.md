# Astro Decap Collection

Derive [Astro content collection](https://docs.astro.build/en/guides/content-collections/) schemata from [Decap collection configs](https://decapcms.org/docs/configuration-options/#collections).

The procedure is to transform a Decap config into a [Zod schema](https://zod.dev/?id=basic-usage) by mapping the [Decap widget fields](https://decapcms.org/docs/widgets/) with custom [transformers](./src/transformers/).

## Usage

This module can either be used as a CLI tool or as a programmatic library.

| cli                                                         | programmatic                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| 1. Run cli tool to generate the zod schema                  | 1. Load or import your Decap config file manually                   |
| 2. Load the generated schema in the Astro collection config | 2. Transform Decap config into zod schema                           |
|                                                             | 3. Provide the zod schema at runtime in the Astro collection config |

### Cli usage

Transform the Decap config at build time and use the generated Zod schema. This allows Astro to validate the given data and provides types as well.

> This is the recommended way to use this module.

| Option           | Description                                     |
| ---------------- | ----------------------------------------------- |
| `--config`, `-c` | Path to the Decap YML config file               |
| `--target`, `-t` | Path to the Astro content directory to write to |

_The name of the target file will be `config.<collection>.ts`, using the collection name from the Decap config._

```bash
# astro-decap-collection, adc - Binary name
# --config, -c - Decap YML config file path to read from
# --target, -t - Astro content directory path to write to

# full command:
astro-decap-collection --config ./public/admin/config.yml --target ./src/content
# or shorthand:
adc -c ./public/admin/config.yml -t ./src/content
```

> The cli command should be run at least before every `astro build`.

Then, the generated schema can be used in the [Astro collection config](https://docs.astro.build/en/guides/content-collections/#defining-collections).

```typescript
import { defineCollection } from 'astro:content';
import { prepareSchema } from 'astro-decap-collection';

// grab generated schema
import { schema } from './config.blog.ts';

// define the collection
// https://docs.astro.build/en/guides/content-collections/#defining-collections
export const collections = {
  blog: defineCollection(prepareSchema(schema)),
  // ... or without the convenience wrapper
  blog: defineCollection({ type: 'content', schema }),
};
```

### Programmatic usage

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

## Local development

Run a local tsx compiler in watch mode

```bash
npx tsx watch ./src/cli.ts -c ../website/public/admin/config.yml -t ../website/src/content
```
