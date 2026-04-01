import { Chart } from "lightweight-charts-react-components";

const result = Chart != null && ["function", "object"].includes(typeof Chart);

if (!result) {
  throw new Error(`Unexpected Chart export type: ${typeof Chart}`);
}

// eslint-disable-next-line no-console
console.log("ok");
