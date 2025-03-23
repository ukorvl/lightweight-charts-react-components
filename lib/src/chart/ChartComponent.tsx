import { ChartContext } from "./ChartContext";
import { useInitChart } from "./useInitChart";
import { ChartProps } from "./types";

type ChartComponentProps = {
  container: HTMLElement;
} & Omit<ChartProps, "className">;

const ChartComponent: React.FC<ChartComponentProps> = ({ children, container, ...rest }) => {
  const chartApiRef = useInitChart({ container, ...rest });

  return <ChartContext.Provider value={chartApiRef.current}>{children}</ChartContext.Provider>;
};

export default ChartComponent;
