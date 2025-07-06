# 📦 Migration guide

This guide explains how to upgrade to the latest version of `lightweight-charts-react-components`.
If you're stuck, [open an issue](https://github.com/ukorvl/lightweight-charts-react-components/issues) or ask a question in the [discussions](https://github.com/ukorvl/lightweight-charts-react-components/discussions).

---

Next migration goes here

---

## Migrating to v1.0.0

### 1. Pane api changed

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
