import { Stack } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps, FC, ReactNode } from "react";

type ScrollableContainerProps = {
  children: ReactNode;
  direction?: "row" | "column";
  gap?: ComponentProps<typeof Stack>["spacing"];
  sx?: ComponentProps<typeof Stack>["sx"];
};

type Mask = {
  left: boolean;
  right: boolean;
  top?: boolean;
  bottom?: boolean;
};

const leftGradientStyles = {
  maskImage: `linear-gradient(to left, white 90%, transparent 100%)`,
  WebkitMaskImage: `linear-gradient(to left, white 90%, transparent 100%)`,
};

const rightGradientStyles = {
  maskImage: `linear-gradient(to right, white 90%, transparent 100%)`,
  WebkitMaskImage: `linear-gradient(to right, white 90%, transparent 100%)`,
};

const topGradientStyles = {
  maskImage: `linear-gradient(to top, white 90%, transparent 100%)`,
  WebkitMaskImage: `linear-gradient(to top, white 90%, transparent 100%)`,
};

const bottomGradientStyles = {
  maskImage: `linear-gradient(to bottom, white 90%, transparent 100%)`,
  WebkitMaskImage: `linear-gradient(to bottom, white 90%, transparent 100%)`,
};

const leftRightGradientStyles = {
  maskImage: `
    linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)`,
  WebkitMaskImage: `
    linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)`,
};

const topBottomGradientStyles = {
  maskImage: `
    linear-gradient(to top, transparent 0%, white 10%, white 90%, transparent 100%)`,
  WebkitMaskImage: `
    linear-gradient(to top, transparent 0%, white 10%, white 90%, transparent 100%)`,
};

const getMaskStyles = ({ top, right, bottom, left }: Mask) => {
  const styles = {
    ...(left && leftGradientStyles),
    ...(right && rightGradientStyles),
    ...(top && topGradientStyles),
    ...(bottom && bottomGradientStyles),
  };

  if (left && right) {
    Object.assign(styles, leftRightGradientStyles);
  }
  if (top && bottom) {
    Object.assign(styles, topBottomGradientStyles);
  }

  return styles;
};

const ScrollableContainer: FC<ScrollableContainerProps> = ({
  children,
  direction = "row",
  gap = 2,
  sx,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mask, setMask] = useState<Mask>({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateMask = () => {
      const {
        scrollLeft,
        scrollWidth,
        clientWidth,
        scrollTop,
        scrollHeight,
        clientHeight,
      } = el;
      const left = scrollLeft > 0;
      const right = scrollLeft + clientWidth < scrollWidth;
      const top = scrollTop > 0;
      const bottom = scrollTop + clientHeight < scrollHeight;

      setMask({ left, right, top, bottom });
    };

    updateMask();

    el.addEventListener("scroll", updateMask);
    window.addEventListener("resize", updateMask);

    return () => {
      el.removeEventListener("scroll", updateMask);
      window.removeEventListener("resize", updateMask);
    };
  }, []);

  return (
    <Stack
      component="div"
      direction={direction}
      ref={containerRef}
      sx={{
        ...sx,
        overflow: "auto",
        minWidth: 0,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        ...getMaskStyles(mask),
      }}
    >
      <Stack
        component="div"
        gap={gap}
        direction={direction}
        sx={{
          flexShrink: 0,
        }}
        flexWrap="nowrap"
      >
        {children}
      </Stack>
    </Stack>
  );
};

export { ScrollableContainer };
