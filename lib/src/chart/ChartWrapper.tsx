import { forwardRef, useCallback, useState } from "react";
import { ChartComponent } from "./ChartComponent";
import type { ChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const ChartRenderFunction: ForwardRefRenderFunction<HTMLDivElement, ChartProps> = (
  { children, containerProps, ...rest },
  ref
) => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const containerRef = useCallback(
    (r: HTMLDivElement) => {
      setContainer(r);

      if (ref) {
        if (typeof ref === "function") {
          containerRef(r);
        } else {
          ref.current = r;
        }
      }
    },
    [ref]
  );

  return (
    <div ref={containerRef} {...containerProps}>
      {!!container && (
        <ChartComponent container={container} {...rest}>
          {children}
        </ChartComponent>
      )}
    </div>
  );
};

const ChartWrapper: ForwardRefExoticComponent<
  ChartProps & RefAttributes<HTMLDivElement>
> = forwardRef(ChartRenderFunction);
ChartWrapper.displayName = "ChartWrapper";
export { ChartWrapper };
