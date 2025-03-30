import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: colors.pink,
    },
    secondary: {
      main: colors.cyan,
    },
    info: {
      main: colors.cyan,
    },
    background: {
      default: colors.black,
      paper: colors.darkBlue,
    },
    text: {
      primary: colors.white,
      secondary: colors.lightBlue,
    },
  },
  typography: {
    fontFamily: "Roboto",
  },
});

export { theme };
