import { Stack } from "@mui/material";
import { memo } from "react";
import { TimeDisplay } from "./TimeDisplay";
import type { StackProps } from "@mui/material";

type BottoomBarProps = Pick<StackProps, "sx">;

const MemoizedTimeDisplay = memo(TimeDisplay);

const BottoomBar = ({ sx }: BottoomBarProps) => {
  const navbarHeight = "24px";

  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        height: navbarHeight,
        justifyContent: "center",
        alignItems: "center",
        ...sx,
      }}
    >
      <MemoizedTimeDisplay />
      {/* Add your bottom bar content here */}
    </Stack>
  );
};

export { BottoomBar };
