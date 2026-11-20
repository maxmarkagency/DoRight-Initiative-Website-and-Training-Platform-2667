import { defineConfig } from 'vitest/config';

// @vitejs/plugin-react@3 breaks under vitest (preamble error); esbuild's JSX transform is enough for tests.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: { environment: 'jsdom', globals: true, setupFiles: ['src/test/setup.js'] },
});
