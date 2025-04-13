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
    MuiSelect: {
      styleOverrides: {
        root: {
          color: colors.blue,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.gray100,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.gray,
          },
          "&.Mui-disabled": {
            color: `${colors.gray100} !important`,

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.gray100,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: `${colors.gray100} !important`,
            },
          },
        },
        icon: {
          color: colors.blue,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: colors.white,
          "&.Mui-selected": {
            backgroundColor: `${colors.pink}65`,
          },
          "&:hover": {
            backgroundColor: `${colors.pink}15`,
          },
          "&.Mui-selected:hover": {
            backgroundColor: `${colors.pink}50`,
          },
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
