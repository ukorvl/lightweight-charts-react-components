import { useLayoutEffect, useState } from "react";
import React from "react";
import { assignRef } from "@/_shared/assignRef";
import type { GenericChartProps } from "./types";
import type { JSX, ReactNode, Ref } from "react";

type ChartContainerProps = Pick<GenericChartProps, "containerProps" | "containerRef"> & {
  children: (container: HTMLDivElement) => ReactNode;
};

/**
 * Attaches a ref to the container node for as long as both stay the same.
 * Each ref gets its own effect, so replacing one ref never detaches another,
 * and a throwing cleanup cannot keep other refs attached.
 *
 * @param ref - The ref to attach.
 * @param node - The container node, or null before it mounts.
 * @example
 * ```ts
 * useAttachedRef(containerRef, container);
 * ```
 */
const useAttachedRef = (
  ref: Ref<HTMLDivElement> | undefined,
  node: HTMLDivElement | null
): void => {
  useLayoutEffect(() => {
    if (!ref || !node) return;

    const cleanup = assignRef(ref, node);

    return typeof cleanup === "function"
      ? cleanup
      : () => {
          assignRef(ref, null);
        };
  }, [ref, node]);
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

  useAttachedRef(containerRef, container);
  // The same ref passed through both props is attached only once.
  useAttachedRef(legacyRef === containerRef ? undefined : legacyRef, container);

  return (
    <div aria-hidden={true} {...divProps} ref={setContainer}>
      {container && children(container)}
    </div>
  );
};
