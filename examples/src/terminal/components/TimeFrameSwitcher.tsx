import { ArrowDropDown } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Fragment, useState, type MouseEvent } from "react";
import { colors } from "@/common/colors";
import type { TimeFrame } from "@/common/timeFrame";
import { TIME_FRAME_OPTIONS } from "@/common/timeFrame";
import { useTimeFrameStore } from "../stores/timeFrameStore";

type TimeFrameSwitcherProps = {
  elementsToShow?: number;
};

type TimeFrameButtonProps = {
  timeFrame: TimeFrame;
  isSelected: boolean;
  onClick?: (event: MouseEvent<HTMLElement>, newTimeFrame: string | null) => void;
};

const TimeFrameButton = ({ timeFrame, isSelected, onClick }: TimeFrameButtonProps) => {
  return (
    <ToggleButton
      value={timeFrame}
      onClick={onClick}
      sx={{
        color: isSelected ? colors.white : colors.gray,
        fontWeight: 700,
        border: "none",
        borderRadius: 0,
        backgroundColor: "transparent",
      }}
    >
      {timeFrame}
    </ToggleButton>
  );
};

const TimeFrameSwitcher = ({
  elementsToShow = TIME_FRAME_OPTIONS.length,
}: TimeFrameSwitcherProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { timeFrame, setTimeFrame } = useTimeFrameStore();
  const handleTimeFrameChange = (
    _: MouseEvent<HTMLElement>,
    newTimeFrame: string | null
  ) => {
    if (newTimeFrame !== null) {
      setTimeFrame(newTimeFrame as (typeof TIME_FRAME_OPTIONS)[number]);
    }
  };

  const visibleTimeFrames = TIME_FRAME_OPTIONS.slice(0, elementsToShow);
  const restTimeFrames = TIME_FRAME_OPTIONS.slice(elementsToShow);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenuItemSelect = (selectedSeriesType: TimeFrame) => {
    setTimeFrame(selectedSeriesType);
    handleClose();
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={timeFrame}
        exclusive
        onChange={handleTimeFrameChange}
        size="small"
        sx={{
          height: "20px",
          "& .MuiToggleButton-root": {
            px: 2,
            fontSize: "0.75rem",
          },
        }}
      >
        {visibleTimeFrames.map(tf => (
          <TimeFrameButton
            key={tf}
            timeFrame={tf}
            isSelected={tf === timeFrame}
            onClick={handleTimeFrameChange}
          />
        ))}
        {restTimeFrames.length > 0 && (
          <Fragment>
            <IconButton
              sx={{
                color: colors.blue,
              }}
              onClick={handleClick}
            >
              <ArrowDropDown aria-label="More time frames" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              {Array.from(restTimeFrames).map(rtf => {
                return (
                  <MenuItem
                    key={rtf}
                    onClick={() => {
                      handleMenuItemSelect(rtf);
                    }}
                  >
                    <TimeFrameButton timeFrame={rtf} isSelected={rtf === timeFrame} />
                  </MenuItem>
                );
              })}
            </Menu>
          </Fragment>
        )}
      </ToggleButtonGroup>
    </Box>
  );
};

export { TimeFrameSwitcher };
