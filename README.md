<a href="https://www.npmjs.com/package/astro-decap-collection"><img src="https://img.shields.io/npm/v/astro-decap-collection?style=for-the-badge&label=npm%20%40latest&logo=npm" alt="NPM version"/></a>
<a href="https://github.com/davidenke/astro-decap-collection/actions/workflows/main.yml"><img src="https://img.shields.io/github/actions/workflow/status/davidenke/astro-decap-collection/main.yml?style=for-the-badge&label=tests%20%2B%20build&logo=github&logoColor=white" alt="Test and build status"/></a>
<a href="https://github.com/davidenke/astro-decap-collection#readme"><img src="https://img.shields.io/badge/github-sources-blue?style=for-the-badge&logo=github" alt="Sources in GitHub"/></a>
<a href="https://davidenke.github.io/astro-decap-collection"><img src="https://img.shields.io/badge/demo-app-yellow?style=for-the-badge&logo=github&logoSize=50px" alt="Demo app"/></a>

# Astro Decap Collection

Derive [Astro content collection](https://docs.astro.build/en/guides/content-collections/) schemata from [Decap collection configs](https://decapcms.org/docs/configuration-options/#collections).

The procedure is to transform a Decap config into a [Zod schema](https://zod.dev/?id=basic-usage) by mapping the [Decap widget fields](https://decapcms.org/docs/widgets/) with custom [transformers](https://github.com/davidenke/astro-decap-collection/tree/main/src/transformers/).

> A demo application using the transforms to convert in the browser can be [found here](https://davidenke.github.io/astro-decap-collection).

## Installation

```bash
npm i -D astro-decap-collection
# or
pnpm add -D astro-decap-collection
# or
yarn add -D astro-decap-collection
```

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

| Option           | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `--config`, `-c` | Path to the Decap YML config file                                     |
| `--target`, `-t` | Path to the Astro content directory to write to                       |
| `--naming`, `-n` | Naming pattern of the created file [with placeholders](#placeholders) |
| `--watch`, `-w`  | Watch the config file for changes                                     |

_The name of the target file will be `config.<collection>.ts`, using the collection name from the Decap config._

```bash
# astro-decap-collection, adc - Binary name
# --config, -c - Decap YML config file path to read from
# --target, -t - Astro content directory path to write to
# --watch,  -w - Use watch mode

# full command:
astro-decap-collection --config ./public/admin/config.yml --target ./src/content --watch
# or shorthand:
adc -c ./public/admin/config.yml -t ./src/content -w
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

#### Placeholders

The `--name` option can be used to define a naming pattern for the generated file.\
For the time being, the following placeholders are supported:

- `%%name%%` - The name of the collection from the Decap config

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
npx -y tsx watch src/cli.ts -c public/examples/blog.yml -t tmp -w
```
