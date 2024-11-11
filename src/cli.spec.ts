import { exec as _exec } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { promisify } from 'node:util';

const exec = promisify(_exec);
const cmd = 'node --loader ts-node/esm src/cli.ts';

afterEach(async () => await rm('tmp', { recursive: true, force: true }));

describe('cli', () => {
  it('throws an error if no config path is provided', async () => {
    const runsOrFails = () => exec(`${cmd} -t path/to/target`);
    await expect(runsOrFails).rejects.toThrow('Missing config path.');
  });

  it('throws an error if no target path is provided', async () => {
    const runsOrFails = () => exec(`${cmd} path/to/config.yml`);
    await expect(runsOrFails).rejects.toThrow('Missing required argument: --target.');
  });

  it('allows multiple config paths', async () => {
    const { stdout } = await exec(
      `${cmd} -t tmp public/examples/blog.yml public/examples/relation.yml`,
    );
    expect(stdout).toEqual(expect.stringContaining('> blog schema written to'));
    expect(stdout).toEqual(expect.stringContaining('> categories schema written to'));
    expect(stdout).toEqual(expect.stringContaining('> tags schema written to'));
  });

  it('allows glob patterns for config path', async () => {
    const { stdout } = await exec(`${cmd} -t tmp public/examples/*.yml`);
    expect(stdout).toEqual(expect.stringContaining('> blog schema written to'));
    expect(stdout).toEqual(expect.stringContaining('> categories schema written to'));
    expect(stdout).toEqual(expect.stringContaining('> tags schema written to'));
  });

  it('still allows setting a config by argument', async () => {
    const { stdout } = await exec(`${cmd} -c public/examples/blog.yml -t tmp`);
    expect(stdout).toEqual(expect.stringContaining('> blog schema written to'));
  });

  it('allows setting globs as config argument', async () => {
    const { stdout } = await exec(`${cmd} -c 'public/*/blog.yml' -t tmp`);
    expect(stdout).toEqual(expect.stringContaining('> blog schema written to'));
  });

  it('does not throw if the config can not be parsed', async () => {
    const runsOrFails = () => exec(`${cmd} -t tmp public/examples/invalid.yml`);
    await expect(runsOrFails()).resolves.toEqual({ stdout: '', stderr: '' });
  });

  it('loads and transforms a given config', async () => {
    const { stdout } = await exec(`${cmd} -t tmp public/examples/blog.yml`);
    expect(stdout).toEqual(expect.stringContaining('> blog schema written to'));
  });

  it('stores with a custom name', async () => {
    const { stdout } = await exec(`${cmd} -t tmp -n custom.ts public/examples/blog.yml`);
    expect(stdout).toEqual(expect.stringContaining('tmp/custom.ts'));
  });

  it('replaces placeholders in name', async () => {
    const { stdout } = await exec(`${cmd} -t tmp -n cfg.%%name%%.ts public/examples/blog.yml`);
    expect(stdout).toEqual(expect.stringContaining('tmp/cfg.blog.ts'));
  });
});
