/* eslint-disable no-console */
import { execSync } from "child_process";
import { readdirSync, statSync } from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const examplesDir = path.dirname(scriptDir);

const distPath = path.join(examplesDir, "dist");

try {
  const stat = statSync(distPath);
  const isDirectory = stat.isDirectory();
  const notEmpty = readdirSync(distPath).filter(name => !name.startsWith(".")).length > 0;
  const canSkipBuild = isDirectory && notEmpty;

  if (canSkipBuild) {
    console.log("dist/ exists, skipping build");
    process.exit(0);
  } else {
    console.log("dist/ does not exist or empty, building...");
  }
} catch {
  console.log("dist/ does not exist or empty, building...");
}

execSync("npm run build", { stdio: "inherit", cwd: examplesDir });
