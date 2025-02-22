import { defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";
//import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
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

export default defineConfig({
  lib: [
    {
      format: "esm",
      syntax: "es2021",
      banner: {
        js: banner,
      },
      output: {
        filename: {
          js: packageJson.module,
        }
      },
    },
    {
      format: "cjs",
      syntax: "es5",
      banner: {
        js: banner,
      },
      output: {
        filename: {
          js: packageJson.main,
        },
      },
    },
    {
      format: "umd",
      umdName: "LightweightChartsReactComponents",
      syntax: "es5",
      banner: {
        js: banner,
      },
      output: {
        minify: false,
        sourceMap: false,
        filename: {
          js: packageJson.unpkg,
        },
      },
    }
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
  plugins: [pluginReact()],
});
