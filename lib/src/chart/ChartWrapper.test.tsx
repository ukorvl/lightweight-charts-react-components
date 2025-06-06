import { render } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { ChartWrapper } from "./ChartWrapper";

vi.mock("./ChartComponent", () => ({
  ChartComponent: vi.fn(({ children }) => <>{children}</>),
}));

describe("ChartWrapper", () => {
  it("renders children when container is set", () => {
    const { getByText } = render(
      <ChartWrapper>
        <div>Chart Content</div>
      </ChartWrapper>
    );

    const child = getByText("Chart Content");
    expect(child).toBeInTheDocument();
  });

  it("forwards the ref correctly", () => {
    const ref = { current: null };
    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("handles containerProps correctly", () => {
    const { getByRole } = render(
      <ChartWrapper containerProps={{ role: "main" }}>
        <div>Child</div>
      </ChartWrapper>
    );

    const containerDiv = getByRole("main");
    expect(containerDiv).toBeInTheDocument();
  });
});
