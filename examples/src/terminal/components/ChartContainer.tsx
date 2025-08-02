import { Card, CardContent } from "@mui/material";
import { FullScreen } from "@/ui/FullScreen";
import { ChartPanel } from "./ChartPanel";

const ChartContainer = () => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: { xs: 480, md: 575 },
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <FullScreen<HTMLDivElement>
          render={({ ref }) => (
            <div
              ref={ref}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <ChartPanel ref={ref} />
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
};

export { ChartContainer };
