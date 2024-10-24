import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(_exec);
const cmd = 'node --loader ts-node/esm src/cli.ts';

describe('cli', () => {
  it('throws an error if no config path is provided', async () => {
    const runsOrFails = () => exec(`${cmd} -t path/to/target`);
    await expect(runsOrFails).rejects.toThrow('Missing required argument: --config.');
  });

  it('throws an error if no target path is provided', async () => {
    const runsOrFails = () => exec(`${cmd} -c path/to/config.yml`);
    await expect(runsOrFails).rejects.toThrow('Missing required argument: --target.');
  });

  it('throws an error if the config path is invalid', async () => {
    const runsOrFails = () => exec(`${cmd} -c path/to/config.yml -t tmp`);
    await expect(runsOrFails).rejects.toThrow('Error: File not found: path/to/config.yml');
  });

  it('does not throw if the config can not be parsed', async () => {
    const runsOrFails = () => exec(`${cmd} -c public/examples/invalid.yml -t tmp`);
    await expect(runsOrFails()).resolves.toEqual({ stdout: '', stderr: '' });
  });

  it('loads and transforms a given config', async () => {
    const { stdout } = await exec(`${cmd} -c public/examples/blog.yml -t tmp`);
    expect(stdout).toEqual(expect.stringContaining('> blog schema written to'));
  });
});
