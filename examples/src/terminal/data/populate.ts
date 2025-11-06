import { doneMessageType, type DoneMessage, type GenerateMessage } from "./generate";
import { initDb } from "./idb";
import { worker } from "./worker";
import type { IDBPDatabase } from "idb";

const initialDataItemsCount = 30 * 24 * 60 * 60; // 30 days worth of data

const hasDataInStore = async (db: IDBPDatabase): Promise<boolean> => {
  const store = db.transaction("Candlestick").objectStore("Candlestick");
  const count = await store.count();

  return !(count < initialDataItemsCount);
};

const generateSeriesDataIfNotExists = async () => {
  const db = await initDb();

  const exists = await hasDataInStore(db);
  if (exists) {
    return;
  }

  worker.postMessage({
    type: "generateAndSave",
    payload: {
      count: initialDataItemsCount,
      timeFrame: "1s",
      seriesType: "Candlestick",
    },
  } satisfies GenerateMessage);

  worker.onmessage = (event: MessageEvent<DoneMessage>) => {
    const { type } = event.data;

    if (type === doneMessageType) {
      // Data generation is complete, notify react components
    }
  };

  worker.onerror = error => {
    throw new Error(`Worker error: ${error.message}`);
  };
};

generateSeriesDataIfNotExists();
