import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  cssVariables: true,
  components: {
    MuiCardHeader: {
      styleOverrides: {
        action: {
          margin: 0,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        track: {
          backgroundColor: colors.white,
        },
      },
    },
  },
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
      paper: colors.blue200,
    },
    text: {
      primary: colors.white,
      secondary: colors.blue,
      disabled: colors.gray100,
    },
    divider: colors.gray100,
  },
  typography: {
    fontFamily: "Roboto",
  },
});

export { theme };
