import { SvgIcon } from "@mui/material";
import type { SvgIconProps } from "@mui/material";

const StackBlitzIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
      >
        <title>Stackblitz icon</title>
        <path d="M5.853 18.647h8.735L9.45 31l16.697-17.647h-8.735L22.55 1z"></path>
      </svg>
    </SvgIcon>
  );
};

export { StackBlitzIcon };
