import { Fullscreen, FullscreenExit } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useFullScreenContext } from "@/ui/FullScreen";
import type { IconButtonProps } from "@mui/material";

const FullScreenToggle = (props: IconButtonProps) => {
  const { isFullScreen, toggleFullScreen } = useFullScreenContext();

  return (
    <Tooltip
      placement="top"
      title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -14],
              },
            },
          ],
        },
      }}
    >
      <IconButton
        onClick={toggleFullScreen}
        color="inherit"
        aria-label="Toggle Full Screen"
        {...props}
      >
        {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
    </Tooltip>
  );
};

export { FullScreenToggle };
