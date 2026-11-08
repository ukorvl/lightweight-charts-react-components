import { describe, expect, it, vi } from "vitest";
import { LinkChecker } from "../check-md-links.mts";

describe("check-md-links", () => {
  it("skips vbscript URLs", () => {
    const checker = new LinkChecker();

    expect(checker.isSkippableLink("vbscript:alert(1)")).toBe(true);
  });

  it("checks links to this repo's main branch against the checkout", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const checker = new LinkChecker(undefined, fetchImpl);
    const repoUrl = "https://github.com/ukorvl/lightweight-charts-react-components";
    const link = { file: "README.md", line: 1 };

    await expect(
      checker.checkLink({ ...link, href: `${repoUrl}/blob/main/CONTRIBUTING.md` })
    ).resolves.toBe(true);
    await expect(
      checker.checkLink({ ...link, href: `${repoUrl}/tree/main/skills` })
    ).resolves.toBe(true);
    await expect(
      checker.checkLink({ ...link, href: `${repoUrl}/blob/main/examples/src/samples` })
    ).resolves.toBe(true);
    await expect(
      checker.checkLink({ ...link, href: `${repoUrl}/blob/main/missing.md` })
    ).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("still fetches main branch links to other repos", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response());
    const checker = new LinkChecker(undefined, fetchImpl);
    const href = "https://github.com/tradingview/lightweight-charts/blob/main/README.md";

    await expect(checker.checkLink({ href, file: "README.md", line: 1 })).resolves.toBe(
      true
    );
    expect(fetchImpl).toHaveBeenCalledWith(href);
  });
});
