import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootUrl = new URL('.', import.meta.url);
const resolveFromRoot = (path: string): string => fileURLToPath(new URL(path, rootUrl));

export default defineConfig({
  root: 'public',
  publicDir: false,
  server: {
    fs: {
      allow: [resolveFromRoot('.')]
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '/src': resolveFromRoot('src'),
      '@core': resolveFromRoot('src/core'),
      '@physics': resolveFromRoot('src/physics'),
      '@pathfinding': resolveFromRoot('src/pathfinding'),
      '@robot': resolveFromRoot('src/robot'),
      '@factory': resolveFromRoot('src/factory'),
      '@fleet': resolveFromRoot('src/fleet'),
      '@iot': resolveFromRoot('src/iot'),
      '@rendering': resolveFromRoot('src/rendering'),
      '@ui': resolveFromRoot('src/ui'),
      '@types': resolveFromRoot('src/types/index.ts'),
      '@config': resolveFromRoot('config')
    }
  },
  test: {
    environment: 'node',
    include: ['../tests/**/*.test.ts']
  }
});
