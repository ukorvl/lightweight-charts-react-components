import { render } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TimeScaleFitContentTrigger } from "./TimeScaleFitContentTrigger";
import { useTimeScaleFitContentTrigger } from "./useTimeScaleFitContentTrigger";

vi.mock("./useTimeScaleFitContentTrigger");

describe("TimeScaleFitContentTrigger component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(<TimeScaleFitContentTrigger deps={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("calls useTimeScaleFitContentTrigger with the correct props", () => {
    const deps = [1, 2, 3];
    render(<TimeScaleFitContentTrigger deps={deps} />);
    expect(useTimeScaleFitContentTrigger).toHaveBeenCalledWith({ deps });
  });
});
