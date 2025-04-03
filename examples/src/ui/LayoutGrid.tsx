import { Grid2 as Grid } from "@mui/material";
import { Children, FC, ReactNode } from "react";

type LayoutGridProps = {
  children: ReactNode;
};

const LayoutGrid: FC<LayoutGridProps> = ({ children }) => {
  return (
    <Grid container spacing={{ xs: 2, sm: 4 }}>
      {Children.map(children, (child) => (
        <Grid size={{ xs: 12, lg: 6 }}>{child}</Grid>
      ))}
    </Grid>
  );
};

export { LayoutGrid };
