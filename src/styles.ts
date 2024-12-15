import { StyleObject } from "styletron-standard";
import { COLORS } from "../../shared";

const containerStyles: StyleObject = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
};

const chartWidgetContianerStyles: StyleObject = {
  position: "relative",
};

const widgetShadowStyles: StyleObject = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "24px",
  height: "100%",
  background: `linear-gradient(90deg, ${COLORS.gray900} 0%, rgba(33, 33, 33, 0) 100%)`,
  zIndex: 2,
};

export const styles = {
  containerStyles,
  chartWidgetContianerStyles,
  widgetShadowStyles,
};
