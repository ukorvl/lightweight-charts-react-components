import { Card, CardContent, CardActions, CardHeader } from "@mui/material";
import { FC, ReactNode } from "react";

type ChartWidgetCardProps = {
  title: string;
  subTitle?: string;
  children?: ReactNode;
  actionPanel?: ReactNode;
};

const ChartWidgetCard: FC<ChartWidgetCardProps> = ({
  children,
  title,
  subTitle,
  actionPanel,
}) => {
  return (
    <Card sx={{ minWidth: 275, borderRadius: 3 }} variant="outlined">
      <CardHeader title={title} subheader={subTitle} />
      <CardContent>{children}</CardContent>
      {actionPanel && <CardActions>{actionPanel}</CardActions>}
    </Card>
  );
};

export { ChartWidgetCard };
