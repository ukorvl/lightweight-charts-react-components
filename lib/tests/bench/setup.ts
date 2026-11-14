import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";

// jsdom has no matchMedia, which lightweight-charts uses to watch the device pixel ratio once a
// chart stays mounted long enough to finish its asynchronous canvas setup.
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
