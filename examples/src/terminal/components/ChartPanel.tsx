import { Box } from "@mui/material";
import { forwardRef } from "react";
import { colors } from "@/common/colors";
import { Aisde } from "./Aside";
import { BottoomBar } from "./BottomBar";
import { Chart } from "./Chart";
import { Toolbar } from "./Toolbar";
import type { ForwardedRef } from "react";

const ChartPanelRenderFunction = (_: object, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <Box
      component="div"
      ref={ref}
      sx={{
        height: "100%",
        flexGrow: 1,
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateAreas: `
          "toolbar toolbar"
          "aside chart"
          "bottom bottom"
        `,
      }}
    >
      <Toolbar
        sx={{
          gridArea: "toolbar",
          borderBottom: `1px solid ${colors.gray100}`,
        }}
      />
      <Aisde
        sx={{
          gridArea: "aside",
          borderRight: `1px solid ${colors.gray100}`,
        }}
      />
      <Chart
        sx={{
          gridArea: "chart",
        }}
      />
      <BottoomBar
        sx={{
          gridArea: "bottom",
          borderTop: `1px solid ${colors.gray100}`,
        }}
      />
    </Box>
  );
};

const ChartPanel = forwardRef<HTMLDivElement, {}>(ChartPanelRenderFunction);
ChartPanel.displayName = "ChartPanel";

export { ChartPanel };
