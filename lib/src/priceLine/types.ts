import type { IPriceLine, PriceLineOptions } from "lightweight-charts";

/**
 * PriceLine component props.
 */
export type PriceLineProps = {
  price: number;
  options?: Omit<Partial<PriceLineOptions>, "price">;
};

/**
 * PriceLine API reference type that can be used to access the price line plugin API.
 */
export type PriceLineApiRef = {
  _priceLine: IPriceLine | null;
  api: () => IPriceLine | null;
  init: () => IPriceLine | null;
  clear: () => void;
};
