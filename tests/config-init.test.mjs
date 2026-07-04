import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const cliPath = resolve("dist/cli/index.js");

test("init writes portable config from explicit CLI flags", () => {
  const workspace = mkdtempSync(join(tmpdir(), "codemesh-config-"));

  execFileSync(process.execPath, [
    cliPath,
    "init",
    "--repo-root",
    "/tmp/repos",
    "--obsidian-vault",
    "/tmp/vault",
    "--codemesh-root",
    "/tmp/codemesh",
    "--github-owner",
    "example"
  ], {
    cwd: workspace,
    stdio: "pipe"
  });

  const config = JSON.parse(readFileSync(join(workspace, ".codemesh", "config.json"), "utf8"));
  assert.equal(config.repoCategoriesRoot, "/tmp/repos");
  assert.equal(config.obsidianVaultPath, "/tmp/vault");
  assert.equal(config.codemeshRepoPath, "/tmp/codemesh");
  assert.equal(config.githubOwner, "example");
  assert.equal(config.gitlabBaseUrl, "https://gitlab.com");
  assert.deepEqual(config.ignoredCategoryNames, [".agents", ".claude", ".git", "node_modules"]);
});
