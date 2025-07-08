import dayjs from "dayjs";
import type { LineData } from "lightweight-charts";

const generateLineData = (length: number): LineData<string>[] => {
  const start = dayjs().subtract(length, "day");
  let lastValue = Math.floor(Math.random() * 100);

  return new Array(length).fill(0).map((_, i) => {
    const change = Math.floor(Math.random() * 21) - 10;
    lastValue = Math.max(0, lastValue + change);

    return {
      time: start.add(i, "day").format("YYYY-MM-DD"),
      value: lastValue,
    };
  });
};

const benchmarkOutPutFileName = "benchmark-results.json";

export { generateLineData, benchmarkOutPutFileName };
