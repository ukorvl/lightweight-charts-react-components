# Price, volume, and indicators

Use this for a technical-analysis view with candles, a moving average, volume,
and optionally an oscillator. The architecture depends on **units**, not on
series type: an SMA shares the price axis; volume needs a separate scale; RSI
usually needs its own pane. Indicators are data series supplied by the application;
the wrapper does not calculate them or fetch market data.

## Choose the layout before adding series

| Desired result               | Placement and scale                            | Why                                           |
| ---------------------------- | ---------------------------------------------- | --------------------------------------------- |
| Candles and SMA              | Same `Pane`, `priceScaleId: "right"`           | Both values are prices                        |
| Readable volume panel        | Separate `Pane`, its own right scale           | Volume cannot compress the price scale        |
| Compact volume under candles | Same pane, `priceScaleId: "volume"` for volume | Independent overlay scale with bottom margins |
| RSI with threshold lines     | Separate pane; RSI series owns the lines       | Different units and useful fixed bounds       |

Prefer one chart with multiple panes when the plots share an instrument and
timeline. They automatically share the horizontal scale and crosshair; no
two-chart synchronization code is needed. `stretchFactor` is a relative weight,
not pixels. Explicit `Pane` components also give watermarks and pane primitives
a valid pane context.

## Recipe: price/SMA, volume, optional RSI

The component expects normalized ascending unique UTC-second candles with volume
attached to every candle. It takes RSI from an upstream calculation (such as
Wilder RSI-14) rather than quietly implementing a different RSI formula. Values
are numbers in the range 0–100. Their timestamps must refer to this candle grid;
the indicator can omit its initial warm-up period.

The local SMA is a simple trailing arithmetic mean, including the current candle.
Its warm-up points are whitespace, not zero prices. Recomputing is suitable for
moderate histories; a high-rate application can calculate incrementally in its
data layer using the same period and timestamp contract.

```tsx
import { useMemo, useState } from "react";
import type {
  CandlestickData,
  HistogramData,
  LineData,
  UTCTimestamp,
  WhitespaceData,
} from "lightweight-charts";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  Pane,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
  WatermarkText,
} from "lightweight-charts-react-components";

type CandleWithVolume = CandlestickData<UTCTimestamp> & { volume: number };
type SmaPoint = LineData<UTCTimestamp> | WhitespaceData<UTCTimestamp>;

export function trailingSma(candles: CandleWithVolume[], period: number): SmaPoint[] {
  if (!Number.isInteger(period) || period < 1) throw new Error("Invalid SMA period");
  let sum = 0;
  return candles.map((bar, index) => {
    sum += bar.close;
    if (index >= period) sum -= candles[index - period].close;
    return index + 1 < period
      ? { time: bar.time }
      : { time: bar.time, value: sum / period };
  });
}

export function AnalysisChart({
  candles,
  rsi,
  datasetId,
}: {
  candles: CandleWithVolume[];
  rsi: LineData<UTCTimestamp>[];
  datasetId: string;
}) {
  const [showRsi, setShowRsi] = useState(true);
  const price = useMemo(
    () =>
      candles.map(({ time, open, high, low, close }) => ({
        time,
        open,
        high,
        low,
        close,
      })),
    [candles]
  );
  const volume = useMemo<HistogramData<UTCTimestamp>[]>(
    () =>
      candles.map(bar => ({
        time: bar.time,
        value: bar.volume,
        color: bar.close >= bar.open ? "#26a69a80" : "#ef535080",
      })),
    [candles]
  );
  const sma = useMemo(() => trailingSma(candles, 20), [candles]);

  return (
    <section>
      <button onClick={() => setShowRsi(value => !value)}>
        {showRsi ? "Hide RSI" : "Show RSI"}
      </button>
      <Chart
        key={datasetId}
        options={{ autoSize: true, layout: { panes: { enableResize: true } } }}
        containerProps={{ style: { height: 540 } }}
      >
        <Pane stretchFactor={3}>
          <CandlestickSeries data={price} options={{ priceScaleId: "right" }} />
          <LineSeries
            data={sma}
            options={{
              priceScaleId: "right",
              color: "#2962ff",
              lineWidth: 2,
              priceLineVisible: false,
            }}
          />
          <WatermarkText
            lines={[{ text: "PRICE + SMA 20", color: "#64748b80", fontSize: 14 }]}
          />
        </Pane>
        <Pane stretchFactor={1}>
          <HistogramSeries
            data={volume}
            options={{ priceFormat: { type: "volume" }, priceLineVisible: false }}
          />
          <WatermarkText lines={[{ text: "VOLUME", color: "#64748b80", fontSize: 14 }]} />
        </Pane>
        {showRsi && (
          <Pane stretchFactor={1}>
            <LineSeries
              data={rsi}
              options={{
                color: "#a855f7",
                priceLineVisible: false,
                // Fixed bounds come from the series autoscale info, so RSI
                // stays on 0–100 while the user zooms and pans.
                autoscaleInfoProvider: () => ({
                  priceRange: { minValue: 0, maxValue: 100 },
                }),
              }}
            >
              <PriceLine
                price={70}
                options={{ title: "70", color: "#a855f7", lineStyle: 2 }}
              />
              <PriceLine
                price={30}
                options={{ title: "30", color: "#a855f7", lineStyle: 2 }}
              />
            </LineSeries>
            <WatermarkText
              lines={[{ text: "RSI 14", color: "#64748b80", fontSize: 14 }]}
            />
          </Pane>
        )}
        <TimeScale>
          {/* Pane visibility changes should not reset horizontal zoom. */}
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </section>
  );
}
```

Mount this after the initial snapshot is ready. `datasetId` changes only when the
symbol, interval, or intended initial view changes, not on every live tick. Fresh
indicator arrays legitimately cause full replacements. If frequent recalculation
is expensive, move it into the data owner rather than mutating chart input objects.

## Recipe: compact volume overlay with the correct scale owner

Give the volume series a custom `priceScaleId` and render `PriceScale` with the
same `id` inside that series. The overlay scale exists only after a series that
uses it is added: a nested `PriceScale` waits for its parent series and targets
the pane it is rendered in. A sibling `PriceScale` placed before the series runs
too early and throws an incorrect-ID error in development builds. Keep scale
options in stable objects so they are not reapplied on every render.

```tsx
import type { CandlestickData, HistogramData, UTCTimestamp } from "lightweight-charts";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  Pane,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const priceScaleOptions = { scaleMargins: { top: 0.05, bottom: 0.25 } };
const volumeScaleOptions = { scaleMargins: { top: 0.8, bottom: 0 } };

export function PriceWithVolumeOverlay({
  price,
  volume,
}: {
  price: CandlestickData<UTCTimestamp>[];
  volume: HistogramData<UTCTimestamp>[];
}) {
  return (
    <Chart options={{ autoSize: true }} containerProps={{ style: { height: 360 } }}>
      <Pane>
        <CandlestickSeries data={price} options={{ priceScaleId: "right" }}>
          <PriceScale id="right" options={priceScaleOptions} />
        </CandlestickSeries>
        <HistogramSeries
          data={volume}
          options={{
            priceScaleId: "volume",
            priceFormat: { type: "volume" },
            priceLineVisible: false,
            lastValueVisible: false,
          }}
        >
          <PriceScale id="volume" options={volumeScaleOptions} />
        </HistogramSeries>
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
}
```

**Version note:** in `lightweight-charts-react-components` `2.6.1`, `PriceScale`
always targets pane zero and does not wait for its parent series, so the nested
`<PriceScale id="volume" />` above throws an incorrect-ID error. The default
`"right"` scale in the first pane works as written. On `2.6.1`, pass
`ref={volumeRef}` (a `useRef<SeriesApiRef<"Histogram">>(null)`) to the volume
series instead of nesting `PriceScale`, and call
`useSeriesScaleMargins(volumeRef, 0.8, 0)`. The series API scale always targets
the series' actual pane; the ready loop handles the ref being assigned before
the native series exists.

```tsx
import { useEffect, type RefObject } from "react";
import type { SeriesType } from "lightweight-charts";
import type { SeriesApiRef } from "lightweight-charts-react-components";

export function useSeriesScaleMargins<T extends SeriesType>(
  seriesRef: RefObject<SeriesApiRef<T> | null>,
  top: number,
  bottom: number
) {
  useEffect(() => {
    let frame = 0;
    const applyMargins = () => {
      const series = seriesRef.current?.api();
      if (!series) {
        frame = requestAnimationFrame(applyMargins);
        return;
      }
      series.priceScale().applyOptions({ scaleMargins: { top, bottom } });
    };
    applyMargins();
    return () => cancelAnimationFrame(frame);
  }, [seriesRef, top, bottom]);
}
```

An overlay scale named `volume` has no visible price axis of its own. Use a
separate pane or visible left axis when users need volume axis labels. Margins
reserve vertical regions on independent scales; they do not rescale or normalize
the input data. If moving a series to another pane imperatively, reacquire its
`priceScale()` after the move rather than keeping a prior scale handle.

## Acceptance checks

- Price remains readable when volume increases by orders of magnitude. Confirm
  the SMA uses the same units and right scale as candles.
- With fewer than 20 candles, SMA is whitespace. At the twentieth bar it equals
  the mean of the first 20 closes. Replacing the last candle recomputes its SMA.
- RSI stays on a 0–100 axis; 30/70 lines belong only to RSI. Toggle its pane and
  verify existing series remain on their original panes and zoom stays intact.
- Render the overlay in a later pane while adapting the recipe: the volume
  margins apply to that pane, with no incorrect-ID error and no change to the
  first pane's scales.
