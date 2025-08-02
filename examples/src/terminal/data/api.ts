import { openDB } from "idb";

const dbPromise = openDB("ChartDB", 1, {
  upgrade(db) {
    db.createObjectStore("ohlc", { keyPath: "timestamp" });
  },
});

export async function getCandles(from: number, to: number): Promise<[]> {
  const db = await dbPromise;
  const store = db.transaction("ohlc").objectStore("ohlc");
  const result = [];
  let cursor = await store.openCursor(IDBKeyRange.bound(from, to));
  while (cursor) {
    result.push(cursor.value);
    cursor = await cursor.continue();
  }
  return result;
}
