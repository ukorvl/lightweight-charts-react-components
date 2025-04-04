import { Grid2 as Grid } from "@mui/material";
import { Children, FC, ReactNode } from "react";

type LayoutGridProps = {
  children: ReactNode;
};

const LayoutGrid: FC<LayoutGridProps> = ({ children }) => {
  const childrenLength = Children.count(children);
  const numberOfChildrenIsOdd = childrenLength % 2 === 1;

  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 4 }}
      justifyContent={numberOfChildrenIsOdd ? "center" : "stretch"}
    >
      {Children.map(children, (child, i) => (
        <Grid
          size={{
            xs: 12,
            lg: numberOfChildrenIsOdd ? (i === childrenLength - 1 ? 8 : 6) : 6,
          }}
          key={i}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export { LayoutGrid };
