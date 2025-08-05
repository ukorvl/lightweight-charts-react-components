import { Stack } from "@mui/material";
import type { StackProps } from "@mui/material";

type AsideProps = Pick<StackProps, "sx">;

const Aisde = ({ sx }: AsideProps) => {
  return (
    <Stack
      component="aside"
      sx={{
        height: "100%",
        padding: 2,
        ...sx,
      }}
    >
      {/* Aside content goes here */}
    </Stack>
  );
};

export { Aisde };
