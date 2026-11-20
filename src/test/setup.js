import '@testing-library/jest-dom/vitest';

// jsdom lacks these browser APIs; framer-motion and Puck touch them at import/mount time.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver ??= NoopObserver;
globalThis.ResizeObserver ??= NoopObserver;
window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
});
