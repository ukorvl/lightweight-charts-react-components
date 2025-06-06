import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { version } from "lightweight-charts/package.json";

const standaloneBuild = fs.readFileSync(
  path.join(__dirname, "../../dist/lightweight-charts-react-components.standalone.js"),
  "utf8"
);

const dom = new JSDOM(
  `
  <!DOCTYPE html>
  <html>
    <head>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/lightweight-charts@${version}/dist/lightweight-charts.standalone.development.js"></script>
      <script>${standaloneBuild}</script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `,
  {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.window = dom.window as any;
