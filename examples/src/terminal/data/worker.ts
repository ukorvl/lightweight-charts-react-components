// src/workers/data.worker.ts

import { openDB } from "idb";
import { generateSeriesData } from "./populate";
import type { GenerateOptions } from "./populate";

const dbPromise = openDB("ChartDB", 1, {
  upgrade(db) {
    db.createObjectStore("ohlc", { keyPath: "timestamp" });
    db.createObjectStore("line", { keyPath: "timestamp" });
  },
});

self.onmessage = async event => {
  const { type, payload } = event.data;

  if (type === "generateAndSave") {
    const { count, interval, seriesType } = payload as GenerateOptions;

    const data = generateSeriesData({ count, interval, seriesType });

    const db = await dbPromise;
    const tx = db.transaction(seriesType, "readwrite");
    const store = tx.objectStore(seriesType);

    for (const item of data) {
      store.put(item);
    }

    await tx.done;

    self.postMessage({ type: "done", seriesType, count });
  }
};
