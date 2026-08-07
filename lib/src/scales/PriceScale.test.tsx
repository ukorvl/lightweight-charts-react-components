import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PriceScale } from "./PriceScale";
import { usePriceScale } from "./usePriceScale";
import type { PriceScaleApiRef } from "./types";

vi.mock("./usePriceScale");

const mockApiRef = {
  api: vi.fn(),
  init: vi.fn(),
  clear: vi.fn(),
  _priceScale: null,
  setId: vi.fn(),
};

vi.mocked(usePriceScale).mockReturnValue({
  current: mockApiRef,
});

describe("PriceScale component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards ref in PriceLine", () => {
    const ref = createRef<PriceScaleApiRef>();
    render(<PriceScale ref={ref} id="left" />);
    expect(ref.current).toBe(mockApiRef);
  });

  it("updates the forwarded ref when usePriceScale returns a new api ref", () => {
    const nextApiRef = { ...mockApiRef };
    const ref = createRef<PriceScaleApiRef>();
    const mockedUsePriceScale = vi.mocked(usePriceScale);
    mockedUsePriceScale
      .mockReturnValueOnce({
        current: mockApiRef,
      })
      .mockReturnValue({
        current: nextApiRef,
      });

    const { rerender } = render(<PriceScale ref={ref} id="left" />);

    expect(ref.current).toBe(mockApiRef);

    rerender(<PriceScale ref={ref} id="right" />);

    expect(ref.current).toBe(nextApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(
      <PriceScale ref={createRef<PriceScaleApiRef>()} id="left" />
    );
    expect(container.firstChild).toBeNull();
  });
});
