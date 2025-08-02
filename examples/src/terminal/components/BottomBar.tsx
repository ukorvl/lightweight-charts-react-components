import { Stack } from "@mui/material";

const BottoomBar = () => {
  const navbarHeight = "24px";

  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        height: navbarHeight,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Add your bottom bar content here */}
    </Stack>
  );
};

export { BottoomBar };
