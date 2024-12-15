import { defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  lib: [
    // ...
  ],
  output: {
    target: "web",
  },
  plugins: [pluginReact()],
});
