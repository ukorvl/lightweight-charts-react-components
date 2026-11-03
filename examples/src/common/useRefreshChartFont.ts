import { useEffect, useRef } from "react";

const useRefreshChartFont = (refreshChart: () => void) => {
  const refreshChartRef = useRef(refreshChart);
  refreshChartRef.current = refreshChart;

  useEffect(() => {
    let isActive = true;
    const fontSet = "fonts" in document ? document.fonts : undefined;

    if (fontSet?.status === "loading") {
      void fontSet.ready.then(() => {
        if (isActive) {
          refreshChartRef.current();
        }
      });
    }

    return () => {
      isActive = false;
    };
  }, []);
};

export { useRefreshChartFont };
