import { render, cleanup } from "@testing-library/react";
import { afterEach, bench, describe } from "vitest";
import { Chart, LineSeries } from "lightweight-charts-react-components";
import { generateLineData } from "./utils";

describe("Chart Rendering Performance", () => {
  afterEach(() => {
    cleanup();
  });

  bench("Empty chart initialization", () => {
    const { unmount } = render(<Chart />);
    unmount();
  });

  bench("Chart with 100 data points", () => {
    const data = generateLineData(100);
    const { unmount } = render(
      <Chart>
        <LineSeries data={data} />
      </Chart>
    );
    unmount();
  });

  //   bench("Chart with 1000 data points", () => {
  //     const data = generateLineData(1000);
  //     const { unmount } = render(
  //       <Chart>
  //         <LineSeries data={data} />
  //       </Chart>
  //     );
  //     unmount();
  //   });

  //   bench("Chart with 10000 data points", () => {
  //     const data = generateLineData(10000);
  //     const { unmount } = render(
  //       <Chart>
  //         <LineSeries data={data} />
  //       </Chart>
  //     );
  //     unmount();
  //   });

  //   bench("Candlestick chart with 1000 points", () => {
  //     const data = generateOHLCData(1000);
  //     const { unmount } = render(
  //       <Chart>
  //         <CandlestickSeries data={data} />
  //       </Chart>
  //     );
  //     unmount();
  //   });

  //   bench("Multiple series chart", () => {
  //     const lineData = generateLineData(500);
  //     const candlestickData = generateOHLCData(500);
  //     const { unmount } = render(
  //       <Chart>
  //         <LineSeries data={lineData} />
  //         <CandlestickSeries data={candlestickData} />
  //       </Chart>
  //     );
  //     unmount();
  //   });
  // });

  // describe("Data Update Performance", () => {
  //   bench("Line series data updates", () => {
  //     let data = generateLineData(100);
  //     const { rerender, unmount } = render(
  //       <Chart>
  //         <LineSeries data={data} />
  //       </Chart>
  //     );

  //     // Simulate data updates
  //     for (let i = 0; i < 10; i++) {
  //       data = [...data, { time: data.length, value: Math.random() * 100 }];
  //       rerender(
  //         <Chart>
  //           <LineSeries data={data} />
  //         </Chart>
  //       );
  //     }

  //     unmount();
  //   });

  //   bench("Bulk data replacement", () => {
  //     const initialData = generateLineData(500);
  //     const { rerender, unmount } = render(
  //       <Chart>
  //         <LineSeries data={initialData} />
  //       </Chart>
  //     );

  //     const newData = generateLineData(500);
  //     rerender(
  //       <Chart>
  //         <LineSeries data={newData} />
  //       </Chart>
  //     );

  //     unmount();
  //   });
});
