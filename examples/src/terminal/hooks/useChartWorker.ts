import { useEffect } from "react";
import { worker } from "../data/worker";
import type { DoneMessage } from "../data/generate";

type UseChartWorkerOptions = {
  onDone?: (msg: DoneMessage) => void;
};

export function useChartWorker({ onDone }: UseChartWorkerOptions = {}) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent<DoneMessage>) => {
      if (event.data.type === "done") {
        onDone?.(event.data);
      }
    };

    worker.addEventListener("message", handleMessage);

    return () => {
      worker.removeEventListener("message", handleMessage);
    };
  }, [onDone]);
}
