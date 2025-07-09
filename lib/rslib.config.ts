import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import { pluginDts } from "rsbuild-plugin-dts";
import packageJson from "./package.json" with { type: "json" };

const banner = `
/**!
* ${packageJson.name} v${packageJson.version}
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
`;

const removeDistPrefix = (path: string) => path.replace(/^.\/dist\//, "");

export default defineConfig({
  source: {
    entry: {
      index: "src/index.ts",
    },
  },
  lib: [
    {
      format: "esm",
      syntax: "es2021",
      banner: {
        js: banner,
        dts: banner,
      },
      output: {
        filename: {
          js: removeDistPrefix(packageJson.module),
        },
      },
      plugins: [
        pluginDts({
          bundle: true,
          autoExternal: {
            dependencies: true,
            peerDependencies: true,
            devDependencies: true,
          },
          banner,
          distPath: "dist",
        }),
      ],
    },
    {
      format: "umd",
      umdName: "LightweightChartsReactComponents",
      syntax: "es5",
      banner: {
        js: banner,
      },
      output: {
        filename: {
          js: removeDistPrefix(packageJson.unpkg),
        },
        externals: {
          react: "React",
          "react-dom": "ReactDOM",
          "lightweight-charts": "LightweightCharts",
        },
      },
    },
  ],
  output: {
    target: "web",
    minify: true,
    distPath: {
      root: "dist",
    },
    cleanDistPath: true,
    sourceMap: true,
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: "classic",
      },
    }),
  ],
});
