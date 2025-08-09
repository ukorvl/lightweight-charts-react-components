import { Settings } from "@mui/icons-material";
import { OffsetTooltip } from "../ui/OffestTooltip";
import { StyledIconButton } from "../ui/StyledIconButton";

const SettingsButton = () => {
  return (
    <OffsetTooltip title="Settings">
      <StyledIconButton aria-label="Settings">
        <Settings />
      </StyledIconButton>
    </OffsetTooltip>
  );
};

export { SettingsButton };
