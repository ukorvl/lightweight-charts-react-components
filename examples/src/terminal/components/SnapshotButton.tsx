import { PhotoCamera } from "@mui/icons-material";
import { OffsetTooltip } from "../ui/OffestTooltip";
import { StyledIconButton } from "../ui/StyledIconButton";

const SnapshotButton = () => {
  return (
    <OffsetTooltip title="Take a snapshot">
      <StyledIconButton aria-label="Take a snapshot">
        <PhotoCamera />
      </StyledIconButton>
    </OffsetTooltip>
  );
};

export { SnapshotButton };
