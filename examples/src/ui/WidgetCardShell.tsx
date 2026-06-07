import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import type { SxProps, Theme } from "@mui/material/styles";
import type { FC, ReactNode } from "react";

type WidgetCardShellProps = {
  title: string;
  subTitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

const WidgetCardShell: FC<WidgetCardShellProps> = ({
  children,
  title,
  subTitle,
  action,
  sx,
}) => {
  return (
    <Card
      sx={[
        {
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <CardHeader
        title={title}
        subheader={subTitle}
        action={action}
        slotProps={{
          title: { component: "h2" },
        }}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export { WidgetCardShell };
