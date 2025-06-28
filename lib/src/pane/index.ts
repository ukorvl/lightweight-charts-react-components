export * from "./types";
export { Pane } from "./Pane";

/**
 * problems we have:
 *
 * 1. when all series are removed from the pane - the pane is removed
 * 2. when pane is removed - other panes change indexes
 *
 * lets first go with pane index prop.
 */
