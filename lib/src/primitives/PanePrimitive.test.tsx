import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PanePrimitive } from "./PanePrimitive";
import { usePanePrimitive } from "./usePanePrimitive";
import type { PanePrimitiveApiRef } from "./types";

vi.mock("./usePanePrimitive");

const mockApiRef = {
  api: vi.fn(),
  init: vi.fn(),
  clear: vi.fn(),
  _primitive: null,
};

vi.mocked(usePanePrimitive).mockReturnValue({
  current: mockApiRef,
});

describe("PanePrimitive component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards ref in PanePrimitive", () => {
    const ref = createRef<PanePrimitiveApiRef>();
    render(<PanePrimitive ref={ref} plugin={{}} />);
    expect(ref.current).toBe(mockApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(
      <PanePrimitive ref={createRef<PanePrimitiveApiRef>()} plugin={{}} />
    );
    expect(container.firstChild).toBeNull();
  });
});
