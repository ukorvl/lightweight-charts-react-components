import { render } from "@testing-library/react";
import { createRef, useContext } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Pane } from "./Pane";
import { PaneContext } from "./PaneContext";
import * as usePaneModule from "./usePane";
import type { PaneApiRef } from "./types";

vi.mock("./usePane");

describe("Pane component", () => {
  const mockApiRef = {
    api: vi.fn(),
    init: vi.fn(),
    clear: vi.fn(),
    _pane: null,
  };

  beforeEach(() => {
    vi.mocked(usePaneModule.usePane).mockReturnValue({
      paneApiRef: {
        current: mockApiRef,
      },
      isReady: true,
    });
  });

  it("forwards ref in Pane component", () => {
    const ref = createRef<PaneApiRef>();
    render(<Pane ref={ref} />);

    expect(ref.current).toBe(mockApiRef);
  });

  it("updates the forwarded ref when usePane returns a new api ref", () => {
    const nextApiRef = { ...mockApiRef };
    const ref = createRef<PaneApiRef>();
    const mockUsePane = vi.mocked(usePaneModule.usePane);
    mockUsePane
      .mockReturnValueOnce({
        paneApiRef: {
          current: mockApiRef,
        },
        isReady: false,
      })
      .mockReturnValue({
        paneApiRef: {
          current: nextApiRef,
        },
        isReady: true,
      });

    const { rerender } = render(<Pane ref={ref} />);

    expect(ref.current).toBe(mockApiRef);

    rerender(<Pane ref={ref} />);

    expect(ref.current).toBe(nextApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(<Pane ref={createRef<PaneApiRef>()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders children", () => {
    const { getByText } = render(
      <Pane>
        <div>Child Content</div>
      </Pane>
    );

    expect(getByText("Child Content")).toBeInTheDocument();
  });

  it("provides paneApiRef and isReady via context", () => {
    let contextValue = null;

    const Consumer = () => {
      contextValue = useContext(PaneContext);
      return null;
    };

    render(
      <Pane>
        <Consumer />
      </Pane>
    );

    expect(contextValue).toEqual({
      paneApiRef: mockApiRef,
      isReady: true,
    });
  });

  it("calls usePane with correct parameters", () => {
    const mockUsePane = vi.mocked(usePaneModule.usePane);
    render(<Pane stretchFactor={2} />);

    expect(mockUsePane).toHaveBeenCalledWith({
      stretchFactor: 2,
    });
  });
});
