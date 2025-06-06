import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TimeScale } from "./TimeScale";
import { useTimeScale } from "./useTimeScale";
import type { TimeScaleApiRef } from "./types";

vi.mock("./useTimeScale");

const mockApiRef = {
  api: vi.fn(),
  init: vi.fn(),
  clear: vi.fn(),
  _timeScale: null,
};

vi.mocked(useTimeScale).mockReturnValue({
  timeScaleApiRef: {
    current: mockApiRef,
  },
  isReady: true,
});

describe("TimeScale component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards ref in TimeScale", () => {
    const ref = createRef<TimeScaleApiRef>();
    render(<TimeScale ref={ref} />);
    expect(ref.current).toBe(mockApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(<TimeScale ref={createRef<TimeScaleApiRef>()} />);
    expect(container.firstChild).toBeNull();
  });
});
