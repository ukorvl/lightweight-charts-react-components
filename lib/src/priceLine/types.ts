import type { IPriceLine, PriceLineOptions } from "lightweight-charts";

/**
 * PriceLine component props.
 */
export type PriceLineProps = {
  /**
   * The price at which the price line should be drawn.
   */
  price: number;
  /**
   * Options for the price line.
   */
  options?: Omit<Partial<PriceLineOptions>, "price">;
};

/**
 * PriceLine API reference type that can be used to access the price line plugin API.
 */
export type PriceLineApiRef = {
  /**
   * Reference to the price line API.
   */
  _priceLine: IPriceLine | null;
  /**
   * Function to get the price line API.
   */
  api: () => IPriceLine | null;
  /**
   * Function to initialize the price line API.
   */
  init: () => IPriceLine | null;
  /**
   * Function to clear the price line API.
   */
  clear: () => void;
};
