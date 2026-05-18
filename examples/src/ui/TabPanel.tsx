import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { FC, ReactNode } from "react";

type TabPanelProps = {
  children: ReactNode;
  sampleId: string;
  tabValue: string;
  sx?: SxProps<Theme>;
};

const normalizeTabValue = (value: string) => value.trim().toLowerCase();

const getTabA11yProps = (sampleId: string, tabValue: string) => {
  const normalizedTabValue = normalizeTabValue(tabValue);

  return {
    id: `${sampleId}-tab-${normalizedTabValue}`,
    "aria-controls": `${sampleId}-tabpanel-${normalizedTabValue}`,
  } as const;
};

const TabPanel: FC<TabPanelProps> = ({ children, sampleId, tabValue, sx }) => {
  const normalizedTabValue = normalizeTabValue(tabValue);

  return (
    <Box
      role="tabpanel"
      id={`${sampleId}-tabpanel-${normalizedTabValue}`}
      aria-labelledby={`${sampleId}-tab-${normalizedTabValue}`}
      sx={{
        flexGrow: 1,
        display: "flex",
        minHeight: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export { getTabA11yProps, TabPanel };
