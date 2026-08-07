import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PriceLine } from "./PriceLine";
import * as usePriceLineModule from "./usePriceLine";
import type { PriceLineApiRef } from "./types";

vi.mock("./usePriceLine");

describe("PriceLine component", () => {
  const mockApiRef = {
    api: vi.fn(),
    init: vi.fn(),
    clear: vi.fn(),
    _priceLine: null,
  };

  beforeEach(() => {
    vi.mocked(usePriceLineModule.usePriceLine).mockReturnValue({
      current: mockApiRef,
    });
  });

  it("forwards ref in PriceLine", () => {
    const ref = createRef<PriceLineApiRef>();
    render(<PriceLine ref={ref} price={100} />);
    expect(ref.current).toBe(mockApiRef);
  });

  it("updates the forwarded ref when usePriceLine returns a new api ref", () => {
    const nextApiRef = { ...mockApiRef };
    const ref = createRef<PriceLineApiRef>();
    const mockUsePriceLine = vi.mocked(usePriceLineModule.usePriceLine);
    mockUsePriceLine
      .mockReturnValueOnce({
        current: mockApiRef,
      })
      .mockReturnValue({
        current: nextApiRef,
      });

    const { rerender } = render(<PriceLine ref={ref} price={100} />);

    expect(ref.current).toBe(mockApiRef);

    rerender(<PriceLine ref={ref} price={200} />);

    expect(ref.current).toBe(nextApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(
      <PriceLine ref={createRef<PriceLineApiRef>()} price={100} />
    );
    expect(container.firstChild).toBeNull();
  });
});
