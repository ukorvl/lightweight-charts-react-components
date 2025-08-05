import { getIntervalInSeconds } from "@/common/timeInterval";
import { doneMessageType, generateMessageType, generateSeriesData } from "./generate";
import { initDb } from "./idb";
import type { GenerateOptions } from "./generate";
import type { CandlestickData } from "lightweight-charts";

self.onmessage = async event => {
  const { type, payload } = event.data;

  if (type === generateMessageType) {
    const { count, timeFrame, seriesType } = payload as GenerateOptions;

    const data = generateSeriesData({ count, timeFrame, seriesType });

    const db = await initDb();
    if (!db.objectStoreNames.contains(seriesType)) {
      return;
    }

    const tx = db.transaction(seriesType, "readwrite");
    const store = tx.objectStore(seriesType);

    for (let i = 0; i < data.length; i++) {
      await store.put(data[i]);
    }

    await tx.done;

    const bucketSize = getIntervalInSeconds(timeFrame);
    const buckets = new Map<number, CandlestickData>();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const bucketKey = Math.floor(item.time / bucketSize) * bucketSize;
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          time: bucketKey,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        });
      } else {
        const bucket = buckets.get(bucketKey)!;
        bucket.high = Math.max(bucket.high, item.high);
        bucket.low = Math.min(bucket.low, item.low);
        bucket.close = item.close;
      }
    }

    const bucketTx = db.transaction(seriesType, "readwrite");
    const bucketStore = bucketTx.objectStore(seriesType);
    await Promise.all([...buckets.values()].map(bucket => bucketStore.put(bucket)));

    await bucketTx.done;

    self.postMessage({ type: doneMessageType, seriesType, count });
    db.close();
  }
};
