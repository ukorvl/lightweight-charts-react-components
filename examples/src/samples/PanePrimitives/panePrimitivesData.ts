import { colors } from "@/common/colors";
import { generateOHLCData } from "@/common/generateSeriesData";
import type { SessionHighlightBand } from "./primitives/SessionHighlight";
import type { HistogramData } from "lightweight-charts";

const ohlcData = generateOHLCData(90);

const volumeData: HistogramData<string>[] = ohlcData.map((bar, index) => {
  const previousBar = ohlcData[index - 1];
  const isUpDay = bar.close >= bar.open;
  const fadedColor = isUpDay ? `${colors.green}90` : `${colors.red}90`;

  return {
    time: bar.time,
    value: previousBar ? Math.abs(bar.close - previousBar.close) * 100 : 320,
    color: fadedColor,
  };
});

const highlightBands: SessionHighlightBand<string>[] = [
  {
    from: ohlcData[8].time,
    to: ohlcData[23].time,
    color: `${colors.cyan}22`,
    label: "Range build-up",
    labelColor: colors.cyan,
  },
  {
    from: ohlcData[28].time,
    to: ohlcData[47].time,
    color: `${colors.orange}26`,
    label: "Macro event window",
    labelColor: colors.orange,
  },
  {
    from: ohlcData[58].time,
    to: ohlcData[74].time,
    color: `${colors.violet}24`,
    label: "Trend expansion",
    labelColor: colors.violet,
  },
];

export { highlightBands, ohlcData, volumeData };
