import Tooltip from "@mui/material/Tooltip";
import { forwardRef } from "react";
import type { TooltipProps } from "@mui/material/Tooltip";

type Offset = [number, number];

export type OffsetTooltipProps = Omit<TooltipProps, "title"> & {
  title: TooltipProps["title"];
  offset?: Offset;
  ariaLabel?: string;
};

const OffsetTooltip = forwardRef<HTMLDivElement, OffsetTooltipProps>(
  function OffsetTooltip(
    {
      children,
      placement = "top",
      offset = [0, -14],
      ariaLabel,
      slotProps,
      title,
      ...rest
    },
    ref
  ) {
    const mergedSlotProps: TooltipProps["slotProps"] = {
      ...slotProps,
      popper: {
        ...slotProps?.popper,
        modifiers: [{ name: "offset", options: { offset } }],
      },
    };

    return (
      <Tooltip
        ref={ref}
        placement={placement}
        title={title}
        aria-label={ariaLabel ?? title?.toString()}
        slotProps={mergedSlotProps}
        {...rest}
      >
        {children}
      </Tooltip>
    );
  }
);

export { OffsetTooltip };
