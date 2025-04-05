import { ChartContext } from "./ChartContext";
import { useChart } from "./useChart";
import type { ChartProps } from "./types";

type ChartComponentProps = {
  container: HTMLElement;
} & Omit<ChartProps, "className">;

const ChartComponent: React.FC<ChartComponentProps> = ({
  children,
  container,
  ...rest
}) => {
  const {
    chartApiRef: { current: chartApiRef },
    initialized,
  } = useChart({ container, ...rest });

  return (
    <ChartContext.Provider
      value={{
        chartApiRef,
        initialized,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export default ChartComponent;
