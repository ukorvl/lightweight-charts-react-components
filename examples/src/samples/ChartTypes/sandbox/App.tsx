import { useState, type ReactElement } from "react";
import {
  AreaSeries,
  CustomChart,
  LineSeries,
  OptionsChart,
  TimeScale,
  TimeScaleFitContentTrigger,
  YieldCurveChart,
} from "lightweight-charts-react-components";
import {
  chartTypeTabs,
  customChartData,
  customChartOptions,
  customSeriesOptions,
  optionsChartData,
  optionsChartOptions,
  optionsSeriesOptions,
  quarterScaleBehavior,
  yieldCurveAreaData,
  yieldCurveAreaOptions,
  yieldCurveChartOptions,
  yieldCurveLineData,
  yieldCurveLineOptions,
  type ChartTypeTab,
} from "../chartTypesShared";
import type { Time } from "lightweight-charts";

const chartContainerProps = {
  style: {
    flexGrow: "1",
  },
} as const;

const buttonStyles = {
  padding: "0.6rem 1rem",
  borderRadius: "999px",
  border: "1px solid #7E89AC",
  background: "transparent",
  color: "#AEB9E1",
  cursor: "pointer",
  fontWeight: 600,
} as const;

const activeButtonStyles = {
  ...buttonStyles,
  borderColor: "#57C3FF",
  background: "#57C3FF",
  color: "#080F25",
} as const;

const chartTypeComponentMap: Record<ChartTypeTab, () => ReactElement> = {
  Options: () => (
    <OptionsChart
      options={{
        ...optionsChartOptions,
        width: 640,
        height: 360,
      }}
      containerProps={chartContainerProps}
    >
      <LineSeries
        data={optionsChartData}
        options={optionsSeriesOptions}
        reactive={false}
      />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </OptionsChart>
  ),
  "Yield curve": () => (
    <YieldCurveChart
      options={{
        ...yieldCurveChartOptions,
        width: 640,
        height: 360,
      }}
      containerProps={chartContainerProps}
    >
      <AreaSeries
        data={yieldCurveAreaData}
        options={yieldCurveAreaOptions}
        reactive={false}
      />
      <LineSeries
        data={yieldCurveLineData}
        options={yieldCurveLineOptions}
        reactive={false}
      />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </YieldCurveChart>
  ),
  Custom: () => (
    <CustomChart<Time, typeof quarterScaleBehavior>
      horzScaleBehavior={quarterScaleBehavior}
      options={{
        ...customChartOptions,
        width: 640,
        height: 360,
      }}
      containerProps={chartContainerProps}
    >
      <LineSeries data={customChartData} options={customSeriesOptions} reactive={false} />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </CustomChart>
  ),
};

const App = () => {
  const [activeTab, setActiveTab] = useState<ChartTypeTab>("Options");
  const ActiveChart = chartTypeComponentMap[activeTab];

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "2rem",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(87, 195, 255, 0.18), transparent 40%), #080F25",
        color: "#f0f0f0",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <section
        style={{
          width: "min(100%, 720px)",
          padding: "1.5rem",
          borderRadius: "24px",
          border: "1px solid rgba(174, 185, 225, 0.12)",
          background: "rgba(16, 25, 53, 0.94)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
        }}
      >
        <header style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              margin: 0,
              color: "#57C3FF",
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Chart wrappers
          </p>
          <h1 style={{ margin: "0.4rem 0 0.3rem", fontSize: "1.8rem" }}>Chart types</h1>
          <p style={{ margin: 0, color: "#AEB9E1" }}>
            Switch between options, yield curve, and custom horizontal scale charts.
          </p>
        </header>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {chartTypeTabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? activeButtonStyles : buttonStyles}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <ActiveChart />
        </div>
      </section>
    </div>
  );
};

export { App };
