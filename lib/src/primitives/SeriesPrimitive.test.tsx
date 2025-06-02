import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeriesPrimitive } from "./SeriesPrimitive";
import { useSeriesPrimitive } from "./useSeriesPrimitive";
import type { SeriesPrimitiveApiRef } from "./types";

vi.mock("./useSeriesPrimitive");

const mockApiRef = {
  api: vi.fn(),
  init: vi.fn(),
  clear: vi.fn(),
  _primitive: null,
};

vi.mocked(useSeriesPrimitive).mockReturnValue({
  current: mockApiRef,
});

describe("SeriesPrimitive component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards ref in SeriesPrimitive", () => {
    const ref = createRef<SeriesPrimitiveApiRef>();
    render(<SeriesPrimitive ref={ref} plugin={{}} />);
    expect(ref.current).toBe(mockApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(
      <SeriesPrimitive ref={createRef<SeriesPrimitiveApiRef>()} plugin={{}} />
    );
    expect(container.firstChild).toBeNull();
  });
});
