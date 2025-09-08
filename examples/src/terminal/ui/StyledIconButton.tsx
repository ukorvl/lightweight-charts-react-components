import { IconButton, styled } from "@mui/material";
import { colors } from "@/common/colors";

const StyledIconButton = styled(IconButton)(() => ({
  color: colors.blue,
  transition: "color 0.3s ease-in-out",
  "&:hover": {
    color: colors.white,
  },
  "&:active": {
    color: colors.white,
  },
  "&.Mui-disabled": {
    color: colors.gray,
    cursor: "not-allowed",
  },
}));

export { StyledIconButton };
