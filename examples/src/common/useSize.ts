import useResizeObserver from "@react-hook/resize-observer";
import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

const useSize = <T extends HTMLElement | null>(target: RefObject<T>) => {
  const [size, setSize] = useState<DOMRectReadOnly>();

  useLayoutEffect(() => {
    if (!target.current) {
      return;
    }

    setSize(target.current.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, entry => setSize(entry.contentRect));
  return size;
};

export { useSize };
