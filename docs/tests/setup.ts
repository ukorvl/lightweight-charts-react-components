import "@testing-library/jest-dom";
import "vitest-canvas-mock";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };
