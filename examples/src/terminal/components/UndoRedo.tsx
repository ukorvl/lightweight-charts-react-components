import { Redo, Undo } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { OffsetTooltip } from "../ui/OffestTooltip";
import { StyledIconButton } from "../ui/StyledIconButton";

const UndoRedo = () => {
  return (
    <Stack direction="row">
      <OffsetTooltip title="Undo last change">
        <StyledIconButton
          disabled
          aria-label="Undo"
          onClick={() => {
            // Implement undo functionality here
          }}
        >
          <Undo color="inherit" />
        </StyledIconButton>
      </OffsetTooltip>

      <OffsetTooltip title="Redo last change">
        <StyledIconButton
          disabled
          aria-label="Redo"
          onClick={() => {
            // Implement redo functionality here
          }}
        >
          <Redo />
        </StyledIconButton>
      </OffsetTooltip>
    </Stack>
  );
};

export { UndoRedo };
