import { forwardRef, useImperativeHandle } from "react";
import { usePanePrimitive } from "./usePanePrimitive";
import type { PanePrimitiveApiRef, PanePrimitiveProps } from "./types";
import type { Time } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

type GenericPanePrimitiveComponent = (<HorzScaleItem = Time>(
  props: PanePrimitiveProps<HorzScaleItem> & {
    ref?: ForwardedRef<PanePrimitiveApiRef<HorzScaleItem>>;
  }
) => ReturnType<typeof PanePrimitiveRenderFunction>) & {
  displayName: string;
};

const PanePrimitiveRenderFunction = <HorzScaleItem = Time,>(
  props: PanePrimitiveProps<HorzScaleItem>,
  ref: ForwardedRef<PanePrimitiveApiRef<HorzScaleItem>>
): JSX.Element | null => {
  const panePrimitiveApiRef = usePanePrimitive(props);
  useImperativeHandle(ref, () => panePrimitiveApiRef.current, [panePrimitiveApiRef]);

  return null;
};

/**
 * PanePrimitive component that can be used to create a primitive on a pane.
 *
 * @param props - The properties for the pane primitive.
 * @param ref - The ref to access the pane primitive API.
 * @returns A React component that renders the pane primitive.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/pane-primitives | Pane primitives documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/plugins/pane-primitives | TradingView documentation for pane primitive}
 * @example
 * ```tsx
 * <Pane>
 *   <PanePrimitive render={({ chart, pane }) => new MyPanePrimitive(chart, pane)} />
 * </Pane>
 * ```
 */
export const PanePrimitive = forwardRef(
  PanePrimitiveRenderFunction
) as GenericPanePrimitiveComponent;
PanePrimitive.displayName = "PanePrimitive";
