import { describe, expect, it } from "vitest";
import {
  assertReadmeVersionReferences,
  README_VERSION_REFERENCES,
  README_VERSION_TOKEN,
  resolveReadmeVersionReference,
  updateReadmeVersionReferences,
} from "../readme-version-references.mts";

describe("README version reference helpers", () => {
  it("replaces the version token in a configured reference", () => {
    expect(
      resolveReadmeVersionReference(README_VERSION_REFERENCES[0], "2.6.0")
    ).toContain("@2.6.0");
  });

  it("rejects references that do not contain the version token", () => {
    expect(() => resolveReadmeVersionReference("https://example.com", "2.6.0")).toThrow(
      `README version reference must include ${README_VERSION_TOKEN}`
    );
  });

  it("updates all configured README references to a target version", () => {
    const initialVersion = "2.5.0";
    const nextVersion = "2.6.0";
    const contents = README_VERSION_REFERENCES.map(reference =>
      resolveReadmeVersionReference(reference, initialVersion)
    ).join("\n");

    const updatedContents = updateReadmeVersionReferences(contents, nextVersion);

    README_VERSION_REFERENCES.forEach(reference => {
      expect(updatedContents).toContain(
        resolveReadmeVersionReference(reference, nextVersion)
      );
    });
  });

  it("fails when an expected reference template is missing from the README contents", () => {
    expect(() =>
      updateReadmeVersionReferences("No version-pinned links here.", "2.6.0", [
        README_VERSION_REFERENCES[0],
      ])
    ).toThrow("Could not find README version reference to update");
  });

  it("asserts that README contents are pinned to the expected version", () => {
    const version = "2.6.0";
    const contents = README_VERSION_REFERENCES.map(reference =>
      resolveReadmeVersionReference(reference, version)
    ).join("\n");

    expect(() =>
      assertReadmeVersionReferences(contents, "lib/README.md", version)
    ).not.toThrow();
    expect(() =>
      assertReadmeVersionReferences(contents, "lib/README.md", "2.7.0")
    ).toThrow("README version reference in lib/README.md is not pinned to 2.7.0");
  });
});
