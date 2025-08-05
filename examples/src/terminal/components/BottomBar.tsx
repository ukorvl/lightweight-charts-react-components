import { Stack } from "@mui/material";
import type { StackProps } from "@mui/material";

type BottoomBarProps = Pick<StackProps, "sx">;

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
      {/* Add your bottom bar content here */}
    </Stack>
  );
};

export { BottoomBar };
