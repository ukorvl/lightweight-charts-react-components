import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { testPackedConsumer } from "../test-packed-consumer.mts";
import { repoRoot } from "./test-helpers.mts";

const { runCommand } = vi.hoisted(() => ({
  runCommand:
    vi.fn<(command: string, args: string[], options: { cwd: string }) => string>(),
}));
vi.mock("node:child_process", () => ({ execFileSync: runCommand }));

const filename = "library.tgz";
const packResult = JSON.stringify([{ filename }]);

describe("packed consumer smoke test", () => {
  beforeEach(() => {
    runCommand.mockReset();
  });

  it("packs once and tests the fixture in two isolated installs", () => {
    runCommand.mockImplementation((_command, [subcommand], { cwd }) => {
      if (subcommand === "pack") return packResult;
      expect(existsSync(path.join(cwd, "package.json"))).toBe(true);
      expect(existsSync(path.join(cwd, "tsconfig.json"))).toBe(true);
      expect(existsSync(path.join(cwd, "smoke.test.tsx"))).toBe(true);
      expect(readFileSync(path.join(cwd, ".npmrc"), "utf8")).toBe(
        readFileSync(path.join(repoRoot, ".npmrc"), "utf8")
      );
      return "";
    });

    testPackedConsumer(repoRoot);

    const calls = runCommand.mock.calls;
    const packDir = path.dirname(calls[1][2].cwd);
    expect(calls.map(([, [subcommand]]) => subcommand)).toEqual([
      "pack",
      "install",
      "ls",
      "test",
      "install",
      "ls",
      "test",
    ]);
    expect(calls[0][1]).toEqual(
      expect.arrayContaining(["--workspace", "lib", "--pack-destination", packDir])
    );
    expect(calls[1][1]).toEqual(
      expect.arrayContaining([
        path.join(packDir, filename),
        "--strict-peer-deps",
        "react@18.2.0",
        "react-dom@18.2.0",
        "lightweight-charts@5.0.8",
        "@types/react@18",
        "@types/react-dom@18",
      ])
    );
    expect(calls[4][1]).toEqual(
      expect.arrayContaining([
        path.join(packDir, filename),
        "--strict-peer-deps",
        "react@latest",
        "react-dom@latest",
        "lightweight-charts@5",
        "@types/react@latest",
        "@types/react-dom@latest",
      ])
    );
    expect(calls[3][2].cwd).toBe(path.join(packDir, "minimum"));
    expect(calls[6][2].cwd).toBe(path.join(packDir, "latest"));
    expect(existsSync(packDir)).toBe(false);
  });

  it("fails and cleans up if the consumer check fails", () => {
    runCommand.mockImplementation((_command, [subcommand]) => {
      if (subcommand === "test") throw new Error("consumer check failed");
      return packResult;
    });

    expect(() => testPackedConsumer(repoRoot)).toThrow("consumer check failed");
    expect(runCommand.mock.calls.map(([, [subcommand]]) => subcommand)).toEqual([
      "pack",
      "install",
      "ls",
      "test",
    ]);
    expect(existsSync(runCommand.mock.calls[3][2].cwd)).toBe(false);
  });
});
