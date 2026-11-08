import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";
import { extractSnippets } from "./utils";

extractSnippets();

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };
