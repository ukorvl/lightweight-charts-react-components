import {
  AreaChart,
  BarChart,
  CandlestickChart,
  LegendToggle,
  ShowChart,
} from "@mui/icons-material";
import { Menu, MenuItem, Typography } from "@mui/material";
import { Fragment, useState, type FC } from "react";
import { useSeriesTypeStore } from "../stores/seriesTypeStore";
import { OffsetTooltip } from "../ui/OffestTooltip";
import { StyledIconButton } from "../ui/StyledIconButton";
import type { SeriesType } from "lightweight-charts";

const seriesTypeMap = new Map<SeriesType, FC>([
  ["Candlestick", CandlestickChart],
  ["Line", ShowChart],
  ["Area", AreaChart],
  ["Bar", BarChart],
  ["Baseline", LegendToggle],
]);

type SeriesTypeMenuProps = {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  onSelect: (seriesType: SeriesType) => void;
};

const SeriesTypeMenu = ({ anchorEl, open, onClose, onSelect }: SeriesTypeMenuProps) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
    >
      {Array.from(seriesTypeMap.keys()).map(seriesType => {
        const MenuItemIcon = seriesTypeMap.get(seriesType) ?? ShowChart;

        return (
          <MenuItem
            key={seriesType}
            onClick={() => {
              onSelect(seriesType);
              onClose();
            }}
          >
            <MenuItemIcon />
            <Typography sx={{ marginLeft: 1 }}>{seriesType}</Typography>
          </MenuItem>
        );
      })}
    </Menu>
  );
};
SeriesTypeMenu.displayName = "SeriesTypeMenu";

const SeriesTypeSwitcher = () => {
  const { seriesType, setSeriesType } = useSeriesTypeStore();
  const IconComponent = seriesTypeMap.get(seriesType) ?? ShowChart;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelect = (selectedSeriesType: SeriesType) => {
    setSeriesType(selectedSeriesType);
    handleClose();
  };

  return (
    <Fragment>
      <OffsetTooltip title={`Current series type: ${seriesType.toLowerCase()}`}>
        <StyledIconButton onClick={handleClick} aria-label="Switch Series Type">
          <IconComponent aria-label="Switch Series Type" />
        </StyledIconButton>
      </OffsetTooltip>
      <SeriesTypeMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </Fragment>
  );
};

export { SeriesTypeSwitcher };
