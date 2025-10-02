import { Fullscreen, FullscreenExit } from "@mui/icons-material";
import { useFullScreenContext } from "@/ui/FullScreen";
import { OffsetTooltip } from "../ui/OffestTooltip";
import { StyledIconButton } from "../ui/StyledIconButton";
import type { IconButtonProps } from "@mui/material";

const FullScreenToggle = (props: IconButtonProps) => {
  const { isFullScreen, toggleFullScreen } = useFullScreenContext();

  return (
    <OffsetTooltip title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
      <StyledIconButton
        onClick={toggleFullScreen}
        aria-label="Toggle Full Screen"
        {...props}
      >
        {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
      </StyledIconButton>
    </OffsetTooltip>
  );
};

export { FullScreenToggle };
