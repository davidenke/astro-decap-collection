import { fileURLToPath } from 'node:url';
import { loadDecapConfig } from './decap.utils.js';

describe('decap.utils', () => {
  describe('loadDecapConfig', () => {
    it('should throw an error if the file does not exist', async () => {
      const path = 'non-existent-file.yml';
      await expect(loadDecapConfig(path)).rejects.toThrow(`File not found: ${path}`);
    });

    it('should return a valid config object', async () => {
      const path = fileURLToPath(new URL('../../mocks/config.yml', import.meta.url));
      const config = await loadDecapConfig(path);

      expect(config).toBeDefined();
      expect(config).toHaveProperty('collections');
      expect(config.collections).toHaveLength(1);
    });
  });
});
