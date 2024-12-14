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

### Usage

Transform the Decap config at build time and use the generated Zod schema. This allows Astro to validate the given data and provides types as well.

| Option           | Description                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--config`, `-c` | Path to the Decap YML config file, can be a [glob pattern](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax)           |
| `--target`, `-t` | Path to the Astro content directory to write to                                                                                             |
| `--naming`, `-n` | Naming pattern of the created file [with placeholders](https://github.com/davidenke/astro-decap-collection?tab=readme-ov-file#placeholders) |
| `--watch`, `-w`  | Watch the config file for changes                                                                                                           |

_The name of the target file will be `config.<collection>.ts` by default, using the collection name from the Decap config._\
_This can be configured with the [`--naming` option placeholders](https://github.com/davidenke/astro-decap-collection?tab=readme-ov-file#placeholders)._

> Config paths can be provided as positionals, thus the `--config` flag is optional.

```bash
# astro-decap-collection, adc - Binary name
# --config, -c - Decap YML config file path to read from
# --target, -t - Astro content directory path to write to
# --watch,  -w - Use watch mode

# full command:
astro-decap-collection --config ./public/admin/config.yml --target ./src/content --watch
# or with shorthands and positionals:
adc -t ./src/content -w ./public/admin/config.yml
# or with glob pattern:
adc -t ./src/content -w ./public/collections/*.yml
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

The `--naming` option can be used to define a naming pattern for the generated file.\
For the time being, the following placeholders are supported:

- `%%name%%` - The name of the collection from the Decap config

## Local development

Run a local tsx compiler in watch mode

```bash
npx -y tsx watch src/cli.ts -c public/examples/blog.yml -t tmp -w
```
