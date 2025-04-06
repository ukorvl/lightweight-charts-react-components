import { CssBaseline, ThemeProvider } from "@mui/material";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { theme } from "./theme";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

const root = createRoot(document.getElementById("root") || document.body);

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
