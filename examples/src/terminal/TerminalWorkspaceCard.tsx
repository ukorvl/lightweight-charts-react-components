import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { colors } from "@/common/colors";
import { WidgetCardShell } from "@/ui/WidgetCardShell";

const panelSx = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: `${colors.black}80`,
};

const TerminalWorkspaceCard = () => {
  return (
    <WidgetCardShell
      title="Terminal"
      subTitle="Expanded workspace sized for chart controls and the main chart view"
      sx={{
        width: "100%",
        maxWidth: 1440,
        minWidth: 275,
        height: { xs: 720, md: 760, lg: 820 },
        marginInline: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        useFlexGap
        sx={{ flexGrow: 1, minHeight: 0 }}
      >
        <Box
          component="aside"
          aria-label="Terminal instruments panel"
          sx={{
            ...panelSx,
            width: { xs: "100%", md: 260 },
            flexShrink: 0,
            padding: { xs: 2, md: 2.5 },
          }}
        >
          <Stack spacing={1.5} useFlexGap>
            <Typography variant="overline" color="text.secondary">
              Instruments
            </Typography>
            <Stack spacing={1.25} useFlexGap></Stack>
          </Stack>
        </Box>
        <Stack spacing={2.5} useFlexGap sx={{ flexGrow: 1, minHeight: 0 }}>
          <Box
            component="section"
            aria-label="Asset info and chart controls"
            sx={{
              ...panelSx,
              padding: { xs: 2, md: 2.5 },
            }}
          >
            <Stack spacing={2} useFlexGap>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", lg: "center" }}
                gap={2}
                useFlexGap
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Asset
                  </Typography>
                  <Typography component="h3" variant="h5" color="text.primary">
                    Apple Inc. (AAPL)
                  </Typography>
                  <Typography color="success.main">+3.88 today</Typography>
                </Box>
                <Stack direction="row" gap={1.25} useFlexGap flexWrap="wrap"></Stack>
              </Stack>
              <Stack direction="row" gap={1.5} useFlexGap flexWrap="wrap"></Stack>
            </Stack>
          </Box>
          <Box
            component="section"
            aria-label="Terminal chart area"
            sx={{
              ...panelSx,
              flexGrow: 1,
              minHeight: 0,
              padding: { xs: 2, md: 3 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundImage: `
                radial-gradient(circle at top right, ${colors.blue100}33, transparent 40%),
                linear-gradient(${colors.gray100}66 1px, transparent 1px),
                linear-gradient(90deg, ${colors.gray100}66 1px, transparent 1px)
              `,
              backgroundSize: "auto, 72px 72px, 72px 72px",
              backgroundPosition: "center",
            }}
          >
            <Stack spacing={1} useFlexGap alignItems="center">
              <Typography component="h3" variant="h5" color="text.primary">
                Chart area
              </Typography>
              <Typography color="text.secondary" maxWidth={460}>
                The main workspace now reserves the left rail for instruments and uses the
                top strip for asset context, statistics, and chart actions.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </WidgetCardShell>
  );
};

export { TerminalWorkspaceCard };
