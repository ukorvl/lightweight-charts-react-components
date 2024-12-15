import { ChartContext } from "./ChartContext";
import { useHandleChartResize } from "./useHandleChartResize";
import { useInitChart } from "./useInitChart";
import { ChartProps } from "./types";

type ChartComponentProps = {
  container: HTMLElement;
} & Omit<ChartProps, "className">;

const ChartComponent: React.FC<ChartComponentProps> = ({ children, container, ...rest }) => {
  const chartApiRef = useInitChart({ container, ...rest });
  const autoResizeEnabled = rest.height === undefined && rest.width === undefined;
  useHandleChartResize(chartApiRef, autoResizeEnabled, container);

  return <ChartContext.Provider value={chartApiRef.current}>{children}</ChartContext.Provider>;
};

export default ChartComponent;
