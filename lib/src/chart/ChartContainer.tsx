import { useMemo, useState } from "react";
import React from "react";
import { assignRef } from "@/_shared/assignRef";
import type { GenericChartProps } from "./types";
import type { JSX, ReactNode } from "react";

type ChartContainerProps = Pick<GenericChartProps, "containerProps" | "containerRef"> & {
  children: (container: HTMLDivElement) => ReactNode;
};

/**
 * Mounts the chart once its wrapper div is available.
 *
 * @param props - The container attributes, refs, and chart render function.
 * @returns The wrapper div.
 * @example
 * ```tsx
 * const containerRef = React.createRef<HTMLDivElement>();
 *
 * <ChartContainer containerProps={{ className: "chart" }} containerRef={containerRef}>
 *   {container => <ChartComponent container={container} />}
 * </ChartContainer>
 * ```
 */
export const ChartContainer = ({
  children,
  containerProps,
  containerRef,
}: ChartContainerProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const { ref: legacyRef, ...divProps } = (containerProps ??
    {}) as JSX.IntrinsicElements["div"];

  const handleContainerRef = useMemo(() => {
    let cleanups: (() => void)[] = [];

    // A void return keeps the DOM ref compatible with React 18.
    return (node: HTMLDivElement | null) => {
      setContainer(node);

      if (node === null) {
        cleanups.forEach(cleanup => cleanup());
        cleanups = [];
        return;
      }

      new Set([containerRef, legacyRef]).forEach(ref => {
        if (!ref) return;

        const cleanup = assignRef(ref, node);
        cleanups.push(
          typeof cleanup === "function" ? cleanup : () => assignRef(ref, null)
        );
      });
    };
  }, [containerRef, legacyRef]);

  return (
    <div aria-hidden={true} {...divProps} ref={handleContainerRef}>
      {container && children(container)}
    </div>
  );
};
