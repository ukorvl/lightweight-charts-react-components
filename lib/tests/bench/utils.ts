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

/**
 * Generates line data plus a function that creates the point after the last generated one.
 */
const createLineDataFeed = (length: number) => {
  const data = generateLineData(length);
  const lastPoint = data[data.length - 1];
  let lastTime = dayjs(lastPoint.time);
  let lastValue = lastPoint.value;

  const nextPoint = (): LineData<string> => {
    lastTime = lastTime.add(1, "day");
    lastValue = Math.max(0, lastValue + Math.floor(Math.random() * 21) - 10);

    return { time: lastTime.format("YYYY-MM-DD"), value: lastValue };
  };

  return { data, nextPoint };
};

export { createLineDataFeed, generateLineData };
