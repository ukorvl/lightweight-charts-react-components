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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flexGrow: 1,
        backgroundColor: colors.blue200,
      }}
    >
      <Toolbar />
      <Aisde />
      <Chart />
      <BottoomBar />
    </Box>
  );
};

const ChartPanel = forwardRef<HTMLDivElement, {}>(ChartPanelRenderFunction);
ChartPanel.displayName = "ChartPanel";

export { ChartPanel };
