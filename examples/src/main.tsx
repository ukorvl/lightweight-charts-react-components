import { createRoot } from "react-dom/client";
import { App } from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { StrictMode } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

const root = createRoot(document.getElementById("root") || document.body);

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
