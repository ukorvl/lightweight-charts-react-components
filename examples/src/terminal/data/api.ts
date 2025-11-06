import type { TimeFrame } from "@/common/timeFrame";
import { getIntervalInSeconds } from "@/common/timeFrame";
import { initDb } from "./idb";
import type { CandlestickData } from "lightweight-charts";

const getDatabase = async () => {
  const db = await initDb();

  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
};

const getStore = async (seriesType: string) => {
  const db = await getDatabase();
  if (!db.objectStoreNames.contains(seriesType)) {
    throw new Error(`Object store ${seriesType} does not exist`);
  }
  return db.transaction(seriesType, "readwrite").objectStore(seriesType);
};

const getCandles = async (from: string, to: string, timeFrame: TimeFrame) => {
  const store = await getStore("Candlestick");

  const range = IDBKeyRange.bound(from, to, true, false);
  const cursor = await store.openCursor(range);

  const bucketSize = getIntervalInSeconds(timeFrame) * 1000; // Convert to milliseconds
  const buckets = new Map<number, CandlestickData>();

  let current = cursor;
  while (current) {
    const item = current.value;
    const time = item.timestamp;

    const bucketStart = Math.floor(time / bucketSize) * bucketSize;
    const existing = buckets.get(bucketStart);

    if (!existing) {
      buckets.set(bucketStart, {
        time: bucketStart,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      });
    } else {
      existing.high = Math.max(existing.high, item.high);
      existing.low = Math.min(existing.low, item.low);
      existing.close = item.close;
    }

    current = await current.continue();
  }

  const result: CandlestickData[] = [];
  buckets.forEach(value => {
    result.push(value);
  });
};

export { getCandles };
