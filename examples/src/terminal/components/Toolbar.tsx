import { Divider, Stack, useTheme } from "@mui/material";
import { memo, useRef } from "react";
import { colors } from "@/common/colors";
import { useSize } from "@/common/useSize";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import { Asset } from "./Asset";
import { CompareAssetsButton } from "./CompareAssetsButton";
import { FullScreenToggle } from "./FullScreenToggle";
import { SeriesTypeSwitcher } from "./SeriesTypeSwitcher";
import { SettingsButton } from "./SettingsButton";
import { SnapshotButton } from "./SnapshotButton";
import { TimeFrameSwitcher } from "./TimeFrameSwitcher";
import { UndoRedo } from "./UndoRedo";
import type { StackProps } from "@mui/material";

type ToolbarProps = Pick<StackProps, "sx">;

const MemoizedFullScreenToggle = memo(FullScreenToggle);
const MemoizedSeriesTypeSwitcher = memo(SeriesTypeSwitcher);
const MemoizedTimeFrameSwitcher = memo(TimeFrameSwitcher);
const MemoizedSettingsButton = memo(SettingsButton);
const MemoizedCompareAssetsButton = memo(CompareAssetsButton);
const MemoizedUndoRedo = memo(UndoRedo);
const MemoizedSnapshotButton = memo(SnapshotButton);
const MemoizedAsset = memo(Asset);

const Toolbar = ({ sx }: ToolbarProps) => {
  const { breakpoints } = useTheme();
  const { md, lg, xl } = breakpoints.values;
  const calcVisibleTimeFrames = (toolbarWidth?: number) => {
    if (!toolbarWidth) {
      return undefined;
    }

    switch (true) {
      case toolbarWidth < md:
        return 4;
      case toolbarWidth < lg:
        return 6;
      case toolbarWidth < xl:
        return 8;
      default:
        return undefined;
    }
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const size = useSize(rootRef);
  const visibleTimeFrames = calcVisibleTimeFrames(size?.width);
  const { VITE_GITHUB_STATIC_ASSETS_BASE_URL } = import.meta.env;

  return (
    <Stack
      sx={{
        alignItems: "flex-start",
        justifyContent: "space-between",
        ...sx,
      }}
      direction="row"
      component="nav"
      aria-label="Chart toolbar"
      ref={rootRef}
    >
      <Stack gap={1}>
        <Stack direction="row" gap={2}>
          <MemoizedAsset
            title="LCRC/USDC"
            imageSrc={`${VITE_GITHUB_STATIC_ASSETS_BASE_URL}/logo.svg`}
            subTitle="Spot"
          />
          <Divider orientation="vertical" flexItem />
          <ScrollableContainer>xsc</ScrollableContainer>
        </Stack>
        <MemoizedTimeFrameSwitcher elementsToShow={visibleTimeFrames} />
      </Stack>
      <Stack direction="row" color={colors.blue}>
        <MemoizedUndoRedo />
        <Divider orientation="vertical" flexItem />
        <MemoizedCompareAssetsButton />
        <MemoizedSeriesTypeSwitcher />
        <Divider orientation="vertical" flexItem />
        <MemoizedSettingsButton />
        <MemoizedSnapshotButton />
        <MemoizedFullScreenToggle />
      </Stack>
    </Stack>
  );
};

export { Toolbar };
