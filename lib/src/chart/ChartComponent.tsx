import { ChartContext } from "./ChartContext";
import { useChart } from "./useChart";
import type { ChartComponentProps } from "./types";

const ChartComponent: React.FC<ChartComponentProps> = ({
  children,
  container,
  onClick,
  onCrosshairMove,
  onInit,
  options,
}) => {
  const {
    chartApiRef: { current: chartApiRef },
    isReady,
  } = useChart({ container, onClick, onCrosshairMove, onInit, options });

  return (
    <ChartContext.Provider
      value={{
        chartApiRef,
        isReady,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export { ChartComponent };
