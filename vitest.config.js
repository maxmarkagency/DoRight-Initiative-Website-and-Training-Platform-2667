import { defineConfig } from 'vitest/config';

// @vitejs/plugin-react@3 breaks under vitest (preamble error); esbuild's JSX transform is enough for tests.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  // dir: only scan src/ (tool folders like .gstack can be unreadable and crash the run).
  test: { dir: 'src', environment: 'jsdom', globals: true, setupFiles: ['src/test/setup.js'] },
});
