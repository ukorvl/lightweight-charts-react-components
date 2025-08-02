import { useSyncExternalStore, useEffect, useState } from "react";
import { getCandles } from "../data/api"; // your read function
import { subscribe, getSnapshot } from "../stores/chartStore";

export function useChartData(from: number, to: number) {
  const version = useSyncExternalStore(subscribe, getSnapshot);
  const [data, setData] = useState([]);

  useEffect(() => {
    getCandles(from, to).then(setData);
  }, [version, from, to]);

  return data;
}
