import { render } from "@testing-library/react";
import { createRef, useContext } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TimeScale } from "./TimeScale";
import { TimeScaleContext } from "./TimeScaleContext";
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

  it("provides the time scale api ref and readiness to children", () => {
    let contextValue: unknown;
    const Child = () => {
      contextValue = useContext(TimeScaleContext);
      return null;
    };

    render(
      <TimeScale>
        <Child />
      </TimeScale>
    );

    expect(contextValue).toEqual({ timeScaleApiRef: mockApiRef, isReady: true });
  });

  it("forwards ref in TimeScale", () => {
    const ref = createRef<TimeScaleApiRef>();
    render(<TimeScale ref={ref} />);
    expect(ref.current).toBe(mockApiRef);
  });

  it("updates the forwarded ref when useTimeScale returns a new api ref", () => {
    const nextApiRef = { ...mockApiRef };
    const ref = createRef<TimeScaleApiRef>();
    const mockedUseTimeScale = vi.mocked(useTimeScale);
    mockedUseTimeScale
      .mockReturnValueOnce({
        timeScaleApiRef: {
          current: mockApiRef,
        },
        isReady: false,
      })
      .mockReturnValue({
        timeScaleApiRef: {
          current: nextApiRef,
        },
        isReady: true,
      });

    const { rerender } = render(<TimeScale ref={ref} />);

    expect(ref.current).toBe(mockApiRef);

    rerender(<TimeScale ref={ref} />);

    expect(ref.current).toBe(nextApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(<TimeScale ref={createRef<TimeScaleApiRef>()} />);
    expect(container.firstChild).toBeNull();
  });
});
