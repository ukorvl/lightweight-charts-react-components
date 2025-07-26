/* eslint-disable no-console */
import { execSync } from "child_process";
import { statSync } from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const examplesDir = path.dirname(scriptDir);

const distPath = path.join(examplesDir, "dist");

try {
  const stat = statSync(distPath);
  if (stat.isDirectory()) {
    console.log("dist/ exists, skipping build");
    process.exit(0);
  } else {
    console.log("dist/ does not exist, building...");
  }
} catch {
  console.log("dist/ does not exist, building...");
}

execSync("npm run build", { stdio: "inherit", cwd: examplesDir });
