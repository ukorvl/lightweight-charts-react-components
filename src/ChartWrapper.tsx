import { ForwardRefRenderFunction, forwardRef, useCallback, useState } from "react";
import { ChartProps } from "./types";
import ChartComponent from "./ChartComponent";
import { useStyletron } from "styletron-react";
import { styles as s } from "./styles";

const ChartRenderFunction: ForwardRefRenderFunction<HTMLDivElement, ChartProps> = (
  { children, className, ...rest },
  ref
) => {
  const [css] = useStyletron();
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
    <div ref={containerRef} className={`${className ? className + " " : ""}${css(s.containerStyles)}`}>
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
