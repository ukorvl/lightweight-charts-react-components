import { Chart } from "lightweight-charts-react-components";

const App = () => {
  return (
    <Chart
      options={{
        layout: {
          textColor: "#fff",
        },
        grid: {
          horzLines: {
            color: "#444",
          },
          vertLines: {
            color: "#444",
          },
        },
      }}
      containerProps={{ style: { flexGrow: "1" } }}
    />
  );
};

export { App };
