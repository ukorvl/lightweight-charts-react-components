import { readdirSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";
import { snippetsDir } from "./utils";

const snippetFiles = readdirSync(snippetsDir).filter(file => file.endsWith(".tsx"));

describe("README examples test", () => {
  for (const file of snippetFiles) {
    const baseName = path.basename(file, ".tsx");

    it(`renders ${baseName}`, async () => {
      const App = (await import(path.join(snippetsDir, file))).App;
      const { container } = render(<App />);

      expect(container).toBeDefined();
      expect(container.firstChild).toBeInTheDocument();
    });
  }
});
