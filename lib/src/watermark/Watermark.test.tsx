import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as useWatermarkModule from "./useWatermark";
import { WatermarkText, WatermarkImage } from "./Watermark";
import type { WatermarkApiRef } from "./types";

vi.mock("./useWatermark");

describe("Watermark components", () => {
  const mockApiRef = {
    api: vi.fn(),
    init: vi.fn(),
    clear: vi.fn(),
    _watermark: null,
  };

  beforeEach(() => {
    vi.mocked(useWatermarkModule.useWatermark).mockReturnValue({
      current: mockApiRef,
    });
  });

  it("forwards ref in WatermarkText", () => {
    const ref = createRef<WatermarkApiRef<"text">>();
    render(<WatermarkText ref={ref} lines={[{ text: "Test", fontSize: 20 }]} />);

    expect(ref.current).toBe(mockApiRef);
  });

  it("forwards ref in WatermarkImage", () => {
    const ref = createRef<WatermarkApiRef<"image">>();
    render(<WatermarkImage ref={ref} src="src" />);

    expect(ref.current).toBe(mockApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(
      <WatermarkText ref={createRef()} lines={[{ text: "Test", fontSize: 20 }]} />
    );
    expect(container.firstChild).toBeNull();
  });
});
