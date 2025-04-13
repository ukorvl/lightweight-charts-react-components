import { create } from "zustand";
import { colors } from "@/colors";
import { generateHistogramData, generateOHLCData } from "@/common/generateSeriesData";
import type { CandlestickData, LineData, WhitespaceData } from "lightweight-charts";

interface PanesControlsStore {
  rsiVisible: boolean;
  volumesVisible: boolean;
  setRsiVisible: (visible: boolean) => void;
  setVolumesVisible: (visible: boolean) => void;
}

const calculateRSI = (
  ohlcData: CandlestickData<string>[],
  period = 14
): (LineData | WhitespaceData)[] => {
  const closes = ohlcData.map(data => data.close);
  const rsiData: (LineData | WhitespaceData)[] = [];

  let gainSum = 0;
  let lossSum = 0;

  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      rsiData.push({ time: ohlcData[i].time });
      continue;
    }

    const change = closes[i] - closes[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.abs(Math.min(change, 0));

    if (i < period) {
      gainSum += gain;
      lossSum += loss;
      rsiData.push({ time: ohlcData[i].time });
      continue;
    }

    if (i === period) {
      gainSum += gain;
      lossSum += loss;

      const avgGain = gainSum / period;
      const avgLoss = lossSum / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      rsiData.push({ time: ohlcData[i].time, value: rsi });
    } else {
      const prevRSIData = rsiData[i - 1] as LineData;
      const prevAvgGain = ((prevRSIData.value ?? 50) / 100) * (lossSum + gainSum);
      const prevAvgLoss = (1 - (prevRSIData.value ?? 50) / 100) * (lossSum + gainSum);

      const avgGain = (prevAvgGain * (period - 1) + gain) / period;
      const avgLoss = (prevAvgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);

      rsiData.push({ time: ohlcData[i].time, value: rsi });
    }
  }

  return rsiData;
};

const ohlcData = generateOHLCData(120);
const rsiData = calculateRSI(ohlcData, 14);
const volumeData = generateHistogramData(120, {
  upColor: `${colors.green}90`,
  downColor: `${colors.red}90`,
});

const usePanesControlsStore = create<PanesControlsStore>(set => ({
  rsiVisible: true,
  volumesVisible: true,
  setRsiVisible: visible => set({ rsiVisible: visible }),
  setVolumesVisible: visible => set({ volumesVisible: visible }),
}));

export { ohlcData, rsiData, volumeData, usePanesControlsStore };
