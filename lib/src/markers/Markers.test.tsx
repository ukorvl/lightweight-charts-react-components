import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Markers } from "./Markers";
import { useMarkers } from "./useMarkers";
import type { MarkersApiRef } from "./types";

vi.mock("./useMarkers");

describe("Markers component", () => {
  const mockApiRef = {
    api: vi.fn(),
    init: vi.fn(),
    clear: vi.fn(),
    _markers: null,
  };

  beforeEach(() => {
    vi.mocked(useMarkers).mockReturnValue({
      current: mockApiRef,
    });
  });

  it("forwards ref in Markers", () => {
    const ref = createRef<MarkersApiRef>();
    render(<Markers ref={ref} markers={[]} />);

    expect(ref.current).toBe(mockApiRef);
  });

  it("should call useMarkers with the correct props", () => {
    const markers = [
      {
        time: "1",
        position: "aboveBar",
        color: "red",
        price: 1,
        shape: "circle",
      } as const,
      {
        time: "2",
        position: "belowBar",
        color: "blue",
        price: 2,
        shape: "circle",
      } as const,
    ];

    render(<Markers ref={createRef<MarkersApiRef>()} markers={markers} />);

    expect(useMarkers).toHaveBeenCalledWith({ markers });
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(
      <Markers ref={createRef<MarkersApiRef>()} markers={[]} />
    );

    expect(container.firstChild).toBeNull();
  });
});
