import { RealTime } from "@/samples/RealTime/RealTime";
import { BasicSeries } from "../../samples/BasicSeries/BasicSeries";
import { CompareSeries } from "../../samples/CompareSeries/CompareSeries";
import { CustomSeries } from "../../samples/CustomSeries/CustomSeries";
import { InfiniteData } from "../../samples/InfiniteData/InfiniteData";
import { WithLegend } from "../../samples/Legend/WithLegend";
import { Markers } from "../../samples/Markers/Markers";
import { Panes } from "../../samples/Panes/Panes";
import { PriceLines } from "../../samples/PriceLines/PriceLines";
import { Primitives } from "../../samples/Primitives/Primitives";
import { RangeSwitcher } from "../../samples/RangeSwitcher/RangeSwitcher";
import { Scales } from "../../samples/Scales/Scales";
import { Tooltips } from "../../samples/Tooltips/Tooltips";
import { Watermark } from "../../samples/Watermark/Watermark";
import { LayoutGrid } from "../../ui/LayoutGrid";

const Contents = () => {
  return (
    <LayoutGrid component="section" aria-label="Examples of library usage">
      <BasicSeries />
      <CustomSeries />
      <RangeSwitcher />
      <Panes />
      <Watermark />
      <WithLegend />
      <CompareSeries />
      <Scales />
      <Tooltips />
      <Markers />
      <InfiniteData />
      <PriceLines />
      <Primitives />
      <RealTime />
    </LayoutGrid>
  );
};

// eslint-disable-next-line import/no-default-export
export default Contents;
