import { ForwardRefRenderFunction, forwardRef, useCallback, useState } from "react";
import { ChartProps } from "./types";
import ChartComponent from "./ChartComponent";

const ChartRenderFunction: ForwardRefRenderFunction<HTMLDivElement, ChartProps> = (
  { children, className, ...rest },
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
    <div ref={containerRef} className={className}>
      {!!container && (
        <ChartComponent container={container} {...rest}>
          {children}
        </ChartComponent>
      )}
    </div>
  );
};

const ChartWrapper = forwardRef(ChartRenderFunction);
ChartWrapper.displayName = "ChartWrapper";
export default ChartWrapper;
