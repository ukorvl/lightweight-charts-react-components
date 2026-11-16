import { useCallback, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import { assignRef } from "@/_shared/assignRef";
import type { GenericChartProps } from "./types";
import type { JSX, ReactNode, Ref, RefObject } from "react";

type ChartContainerProps = Pick<GenericChartProps, "containerProps" | "containerRef"> & {
  children: (container: HTMLDivElement) => ReactNode;
};

/**
 * Attaches a ref to the container node for as long as both stay the same.
 * Each ref gets its own effect, so replacing one ref never detaches another,
 * and a throwing cleanup cannot keep other refs attached.
 *
 * @param ref - The ref to attach.
 * @param nodeRef - The container node assigned during DOM attachment.
 * @param containerKey - The React key that determines when the div is replaced.
 * @example
 * ```ts
 * useAttachedRef(containerRef, nodeRef, containerKey);
 * ```
 */
const useAttachedRef = (
  ref: Ref<HTMLDivElement> | undefined,
  nodeRef: RefObject<HTMLDivElement | null>,
  containerKey: string | undefined
): void => {
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!ref || !node) return;

    const cleanup = assignRef(ref, node);

    return typeof cleanup === "function"
      ? cleanup
      : () => {
          assignRef(ref, null);
        };
  }, [ref, nodeRef, containerKey]);
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const {
    key,
    ref: legacyRef,
    ...divProps
  } = (containerProps ?? {}) as JSX.IntrinsicElements["div"];
  const containerKey = key === undefined ? undefined : String(key);

  const attachContainer = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    setContainer(node);
  }, []);

  // Read the node in this commit so parent layout effects can use the refs.
  useAttachedRef(containerRef, nodeRef, containerKey);
  // The same ref passed through both props is attached only once.
  useAttachedRef(
    legacyRef === containerRef ? undefined : legacyRef,
    nodeRef,
    containerKey
  );

  return (
    <div key={containerKey} aria-hidden={true} {...divProps} ref={attachContainer}>
      {container && children(container)}
    </div>
  );
};
