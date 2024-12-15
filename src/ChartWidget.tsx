import { ForwardRefRenderFunction, forwardRef } from "react";
import { ChartWidgetProps } from "./types";
import ChartWrapper from "./ChartWrapper";
import { ChartOptions, DeepPartial } from "lightweight-charts";
import { LineSeries } from "./series";
import { COLORS } from "../../shared";
import { styles } from "./styles";
import { useStyletron } from "styletron-react";

const chartWidgetDefaultOptions: DeepPartial<ChartOptions> = {
  crosshair: {
    mode: 2,
  },
  leftPriceScale: {
    visible: false,
  },
  timeScale: {
    fixLeftEdge: true,
    fixRightEdge: true,
    visible: false,
  },
};

const ChartWidgetRender: ForwardRefRenderFunction<HTMLDivElement, ChartWidgetProps> = (
  { data, color = COLORS.blue300, className, ...rest },
  ref
) => {
  const [css] = useStyletron();

  return (
    <ChartWrapper
      ref={ref}
      {...chartWidgetDefaultOptions}
      className={`${className ? className + " " : ""}${css(styles.chartWidgetContianerStyles)}`}
      {...rest}
    >
      <div className={css(styles.widgetShadowStyles)} />
      <LineSeries data={data} options={{ color, priceLineVisible: false }} />
    </ChartWrapper>
  );
};

const ChartWidget = forwardRef(ChartWidgetRender);
ChartWidget.displayName = "ChartWidget";
export default ChartWidget;
