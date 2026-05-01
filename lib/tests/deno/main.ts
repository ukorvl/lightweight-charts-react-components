import {
  Chart,
  CustomChart,
  OptionsChart,
  YieldCurveChart,
} from "lightweight-charts-react-components";

const symbols = [
  ["Chart", Chart],
  ["OptionsChart", OptionsChart],
  ["YieldCurveChart", YieldCurveChart],
  ["CustomChart", CustomChart],
];

const invalidSymbols = symbols.filter(
  ([, symbol]) => !["function", "object"].includes(typeof symbol)
);

if (invalidSymbols.length > 0) {
  const details = invalidSymbols
    .map(([name, symbol]) => `${name}: ${typeof symbol}`)
    .join(", ");
  throw new Error(`Unexpected chart export type(s): ${details}`);
}

// eslint-disable-next-line no-console
console.log("ok");
