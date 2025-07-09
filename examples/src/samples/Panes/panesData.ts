import {
  generateOHLCData,
  generateVolumeDataFromOHLC,
} from "@/common/generateSeriesData";
import type { CandlestickData, LineData, WhitespaceData } from "lightweight-charts";

const calculateRSI = (
  ohlcData: CandlestickData<string>[],
  period = 14
): (LineData | WhitespaceData)[] => {
  const closes = ohlcData.map(data => data.close);
  const rsiData: (LineData | WhitespaceData)[] = [];

  let gainSum = 0;
  let lossSum = 0;
  let avgGain: number | null = null;
  let avgLoss: number | null = null;

  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      rsiData.push({ time: ohlcData[i].time });
      continue;
    }

    const change = closes[i] - closes[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    if (i < period) {
      gainSum += gain;
      lossSum += loss;
      rsiData.push({ time: ohlcData[i].time });
      continue;
    }

    if (i === period) {
      gainSum += gain;
      lossSum += loss;
      avgGain = gainSum / period;
      avgLoss = lossSum / period;
    } else {
      avgGain = (avgGain! * (period - 1) + gain) / period;
      avgLoss = (avgLoss! * (period - 1) + loss) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiData.push({ time: ohlcData[i].time, value: rsi });
  }

  return rsiData;
};

const ohlcData = generateOHLCData(100);
const rsiData = calculateRSI(ohlcData, 14);
const volumeData = generateVolumeDataFromOHLC(ohlcData);

export { ohlcData, rsiData, volumeData };
