import { generateLineData } from "@/common/generateSeriesData";
import {
  WatermarkText,
  WatermarkImage,
  WatermarkType,
} from "lightweight-charts-react-components";
import { create } from "zustand";
import { useTheme } from "@mui/material/styles";
import { colors } from "@/colors";
import { encodeInlineSvg } from "@/common/utils";

interface WatermarkStore {
  visibleWatermark: WatermarkType;
  setWatermarkVisible: (w: WatermarkType) => void;
}

const useWatermarkStore = create<WatermarkStore>((set) => ({
  visibleWatermark: "text",
  setWatermarkVisible: (w) => set({ visibleWatermark: w }),
}));

const tvSvg = `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <polygon points="75 40.883 75 156.368 197.75 156.368 197.75 359.117 327.75 359.117 327.75 40.883 75 40.883"
           fill="none" stroke="${colors.blue}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <polygon points="436.7 359.117 571.1 40.883 725 40.883 590.6 359.117 436.7 359.117"
           fill="none" stroke="${colors.blue}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="430.679" cy="93.803" r="65.168"
          fill="none" stroke="${colors.blue}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const useWatermarkComponent = (type: WatermarkType) => {
  const theme = useTheme();

  const watermarkMap = {
    text: () => (
      <WatermarkText
        lines={[
          {
            text: "Your chart name",
            color: `${colors.blue}50`,
            fontSize: 24,
            fontFamily: theme.typography.fontFamily,
          },
          {
            text: "Some other text",
            color: `${colors.pink}50`,
            fontSize: 16,
            fontFamily: theme.typography.fontFamily,
            fontStyle: "bold",
          },
        ]}
        horzAlign="center"
        vertAlign="top"
      />
    ),
    image: () => <WatermarkImage src={encodeInlineSvg(tvSvg)} alpha={0.5} padding={20} />,
  } as const;

  return watermarkMap[type];
};

const seriesData = generateLineData(100);

export { useWatermarkStore, useWatermarkComponent, seriesData };
