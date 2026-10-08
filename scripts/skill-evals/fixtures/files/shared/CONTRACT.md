# Consumer task contract

Implement the exported functional component `Task` in `src/Task.tsx`; its typed
props are in `src/scenario.tsx`. Add supporting source files if useful. The host
controls mounting, data delivery, and the scenario's product controls. Keep host,
scenario, contracts, HTML, package declarations and compiler settings unchanged.
The chart must have a nonzero size inside an approximately 900-pixel-wide page.

For live data and history, `Candle.timeMs` is milliseconds. `onDetails` accepts that
same application shape; the host renders the OHLC panel. `subscribe` returns an
unsubscribe function. `loadBefore(symbol, beforeMs, signal?)` returns older candles
and overlapping existing timestamps; empty results mean exhaustion. Its fake
transport can complete even after aborting, as some cached adapters do.

The volume task supplies already typed UTC-second series data. Its benchmark,
price, and volume have a shared timeline. `showVolume` and data changes come from
the host controls.

Use public package declarations and the local README in `docs/`. Build tools are
installed locally: `node node_modules/typescript/bin/tsc -p tsconfig.json` and
`node node_modules/vite/bin/vite.js build`. Explain library-specific decisions
in comments. The evaluation checks observable behavior, not your hook names or
file structure.
