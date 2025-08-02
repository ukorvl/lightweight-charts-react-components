import { Divider, Stack } from "@mui/material";
import { memo } from "react";
import { FullScreenToggle } from "./FullScreenToggle";

const MemoizedFullScreenToggle = memo(FullScreenToggle);

const Toolbar = () => {
  return (
    <Stack
      sx={{
        padding: 2,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
      direction="row"
      component="nav"
    >
      <Divider orientation="vertical" />
      <MemoizedFullScreenToggle />
    </Stack>
  );
};

export { Toolbar };
