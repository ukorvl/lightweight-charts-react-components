import { Divider, Stack } from "@mui/material";
import { memo } from "react";
import { FullScreenToggle } from "./FullScreenToggle";
import type { StackProps } from "@mui/material";

type ToolbarProps = Pick<StackProps, "sx">;

const MemoizedFullScreenToggle = memo(FullScreenToggle);

const Toolbar = ({ sx }: ToolbarProps) => {
  return (
    <Stack
      sx={{
        padding: 2,
        alignItems: "center",
        justifyContent: "flex-end",
        ...sx,
      }}
      direction="row"
      component="nav"
      aria-label="Chart toolbar"
    >
      <Divider orientation="vertical" />
      <MemoizedFullScreenToggle />
    </Stack>
  );
};

export { Toolbar };
