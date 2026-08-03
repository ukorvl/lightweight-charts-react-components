import type { IChartApi, IPaneApi, Time } from "lightweight-charts";

type PaneLayoutSnapshot = {
  heights: number[];
  stretchFactors: number[];
};

const getPaneRow = (pane: IPaneApi<Time>) => pane.getHTMLElement()?.closest("tr");

const getSeparatorRow = (paneRow: Element | null | undefined) => {
  if (!(paneRow instanceof HTMLTableRowElement)) {
    return null;
  }

  const candidate = paneRow.nextElementSibling;
  if (
    candidate instanceof HTMLTableRowElement &&
    candidate.cells.length === 1 &&
    candidate.cells[0].colSpan > 1
  ) {
    return candidate;
  }

  return null;
};

const focusPane = (chart: IChartApi, paneIndex: number): PaneLayoutSnapshot | null => {
  const panes = chart.panes();
  const targetPane = panes[paneIndex];

  if (!targetPane) {
    return null;
  }

  const paneHeights = panes.map((pane: IPaneApi<Time>) => pane.getHeight());
  const stretchFactors = panes.map((pane: IPaneApi<Time>) => pane.getStretchFactor());
  const totalPaneHeight = paneHeights.reduce(
    (sum: number, height: number) => sum + height,
    0
  );

  panes.forEach((pane: IPaneApi<Time>, index: number) => {
    const paneRow = getPaneRow(pane);
    const separatorRow = getSeparatorRow(paneRow);

    if (paneRow instanceof HTMLTableRowElement) {
      paneRow.style.display = index === paneIndex ? "" : "none";
    }

    if (separatorRow instanceof HTMLTableRowElement) {
      separatorRow.style.display = "none";
    }
  });

  targetPane.setHeight(totalPaneHeight);

  return {
    heights: paneHeights,
    stretchFactors,
  };
};

const restorePanes = (chart: IChartApi, paneLayout: PaneLayoutSnapshot) => {
  const panes = chart.panes();

  panes.forEach((pane: IPaneApi<Time>) => {
    const paneRow = getPaneRow(pane);
    const separatorRow = getSeparatorRow(paneRow);

    if (paneRow instanceof HTMLTableRowElement) {
      paneRow.style.display = "";
    }

    if (separatorRow instanceof HTMLTableRowElement) {
      separatorRow.style.display = "";
    }
  });

  panes.forEach((pane: IPaneApi<Time>, index: number) => {
    const stretchFactor = paneLayout.stretchFactors[index];
    if (stretchFactor !== undefined) {
      pane.setStretchFactor(stretchFactor);
    }
  });
};

export { focusPane, restorePanes, type PaneLayoutSnapshot };
