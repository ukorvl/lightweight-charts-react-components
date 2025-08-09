import { Grid } from "@mui/material";
import { Children } from "react";
import type { ElementType, FC, ReactNode } from "react";

type LayoutGridProps = {
  children: ReactNode;
  component?: ElementType;
};

const LayoutGrid: FC<LayoutGridProps> = ({ children, component, ...rest }) => {
  const childrenLength = Children.count(children);
  const numberOfChildrenIsOdd = childrenLength % 2 === 1;

  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 2 }}
      justifyContent={numberOfChildrenIsOdd ? "center" : "stretch"}
      component={component ?? "div"}
      {...rest}
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
