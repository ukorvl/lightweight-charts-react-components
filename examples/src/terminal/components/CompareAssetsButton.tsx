import { Addchart } from "@mui/icons-material";
import { OffsetTooltip } from "../ui/OffestTooltip";
import { StyledIconButton } from "../ui/StyledIconButton";

const CompareAssetsButton = () => {
  return (
    <OffsetTooltip title="Compare Assets">
      <StyledIconButton aria-label="Compare Assets">
        <Addchart />
      </StyledIconButton>
    </OffsetTooltip>
  );
};

export { CompareAssetsButton };
