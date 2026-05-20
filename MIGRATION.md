# Migration guide

This guide explains how to upgrade to the latest version of `lightweight-charts-react-components`.
If you're stuck, [open an issue](https://github.com/ukorvl/lightweight-charts-react-components/issues) or ask a question in the [discussions](https://github.com/ukorvl/lightweight-charts-react-components/discussions).

---

## Migrating to v2.0.0

`v2.0.0` is mostly a TypeScript migration for users working with non-time horizontal scales.

### 1. Time-based `Chart` usage does not need changes

If you use `Chart` with standard time-based series data and do not import exported wrapper types directly, upgrading from `v1.x` should be a drop-in change.

### 2. Use the new chart components for non-time scales

`OptionsChart`, `YieldCurveChart`, and `CustomChart` are now available for non-time horizontal scales.

```tsx
<OptionsChart>
  <LineSeries
    data={[
      { time: 95, value: 1.2 },
      { time: 100, value: 2.8 },
    ]}
  />
</OptionsChart>
```

### 3. Exported wrapper types are now generic over the horizontal scale item

If you use exported types with non-time charts, pass the horizontal scale item type explicitly.

**Before:**

```ts
type LineRef = SeriesApiRef<"Line">;
type ScaleProps = TimeScaleProps;
type MarkerProps = MarkersProps;
```

**After (number-based horizontal scale):**

```ts
type LineRef = SeriesApiRef<"Line", number>;
type ScaleProps = TimeScaleProps<number>;
type MarkerProps = MarkersProps<number>;
```

The same applies to other exported types such as `ChartApiRef`, `PaneApiRef`, `WatermarkApiRef`, and `SeriesPrimitiveProps`.

---

## Migrating to v1.0.0

### 1. Pane API changed

The `Pane` component is added to the library, which allows you to create multiple panes in a single chart. Series `isPane` property is removed, and you can now use the `Pane` component to create multiple panes.

**Before (not supported anymore):**

```tsx
<LineSeries isPane={true} data={[...]} />
```

**After:**

```tsx
<Pane>
  <LineSeries data={[...]} />
</Pane>
```
