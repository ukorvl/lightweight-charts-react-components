import { openDB } from "idb";
import type { SeriesType } from "lightweight-charts";

const dbName = "ChartDB";
const dbVersion = 1;
const storeName: SeriesType = "Candlestick";
const keyPath = "time";

const initDb = async () => {
  return await openDB(dbName, dbVersion, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath });
      }
    },
  });
};

export { dbName, dbVersion, initDb, storeName, keyPath };
