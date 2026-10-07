import { describe, expect, it } from "vitest";
import { LinkChecker } from "../check-md-links.mts";

describe("check-md-links", () => {
  it("skips vbscript URLs", () => {
    const checker = new LinkChecker();

    expect(checker.isSkippableLink("vbscript:alert(1)")).toBe(true);
  });
});
