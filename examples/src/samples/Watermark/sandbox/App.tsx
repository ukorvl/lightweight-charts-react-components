import {
  Chart,
  LineSeries,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
  WatermarkText,
} from "lightweight-charts-react-components";

const App = () => {
  return (
    <Chart
      options={{
        width: 600,
        height: 400,
      }}
    >
      <Pane>
        <LineSeries
          data={data}
          options={{
            color: "#2962FF",
            lineWidth: 2,
          }}
        />
        <WatermarkText
          lines={[
            {
              text: "Watermark",
              color: "rgba(41, 98, 255, 0.3)",
              fontSize: 28,
            },
            {
              text: "Pane overlay example",
              color: "rgba(233, 30, 99, 0.3)",
              fontSize: 16,
            },
          ]}
          horzAlign="center"
          vertAlign="center"
        />
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

const data = [
  { time: "2025-04-14", value: 83.21 },
  { time: "2025-04-15", value: 67.55 },
  { time: "2025-04-16", value: 70.37 },
  { time: "2025-04-17", value: 97.64 },
  { time: "2025-04-18", value: 91.09 },
  { time: "2025-04-19", value: 72.44 },
  { time: "2025-04-20", value: 74.76 },
  { time: "2025-04-21", value: 80.89 },
  { time: "2025-04-22", value: 88.12 },
  { time: "2025-04-23", value: 81.37 },
];

export { App };
