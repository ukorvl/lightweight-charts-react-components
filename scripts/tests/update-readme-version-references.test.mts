import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  README_VERSION_REFERENCES,
  resolveReadmeVersionReference,
} from "../readme-version-references.mts";
import { run } from "../update-readme-version-references.mts";
import { createTempDir, writeTextFile } from "./test-helpers.mts";

describe("update-readme-version-references", () => {
  it("updates a README file in place", () => {
    const tempDir = createTempDir();
    const readmeFile = path.join(tempDir, "README.md");

    writeTextFile(
      readmeFile,
      `${README_VERSION_REFERENCES.map(reference => resolveReadmeVersionReference(reference, "2.5.0")).join("\n")}\n`
    );

    run({ readmeFile, version: "2.6.0" });

    const nextContents = readFileSync(readmeFile, "utf8");
    README_VERSION_REFERENCES.forEach(reference => {
      expect(nextContents).toContain(resolveReadmeVersionReference(reference, "2.6.0"));
    });
  });

  it("fails when a configured reference template is missing", () => {
    const tempDir = createTempDir();
    const readmeFile = path.join(tempDir, "README.md");

    writeTextFile(readmeFile, "No version references live here.\n");

    expect(() => run({ readmeFile, version: "2.6.0" })).toThrow(
      "Could not find README version reference to update"
    );
  });
});
