import {
  AreaSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const App = () => {
  return (
    <Chart
      options={{
        width: 600,
        height: 400,
      }}
    >
      <AreaSeries data={data} />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

const data = [
  { time: "2025-04-14", value: 83.21 },
  { time: "2025-04-15", value: 67.55 },
  { time: "2025-04-16", value: 15.37 },
  { time: "2025-04-17", value: 97.64 },
  { time: "2025-04-18", value: 31.09 },
  { time: "2025-04-19", value: 52.44 },
  { time: "2025-04-20", value: 2.76 },
  { time: "2025-04-21", value: 40.89 },
  { time: "2025-04-22", value: 78.12 },
  { time: "2025-04-23", value: 61.37 },
];

export { App };
