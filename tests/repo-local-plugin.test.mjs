import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { RepoLocalPlugin } from "../dist/plugins/repo-local/repo-local-plugin.js";

test("local repo discovery indexes category repos and root repos", async () => {
  const root = mkdtempSync(join(tmpdir(), "codemesh-repos-"));
  const categoryPath = join(root, "Apps");
  const appPath = join(categoryPath, "weather-app");
  const rootRepoPath = join(root, "tools");
  const ignoredPath = join(root, "node_modules", "ignored-repo");

  mkdirSync(appPath, { recursive: true });
  mkdirSync(rootRepoPath, { recursive: true });
  mkdirSync(ignoredPath, { recursive: true });

  execFileSync("git", ["init"], { cwd: appPath, stdio: "ignore" });
  execFileSync("git", ["init"], { cwd: rootRepoPath, stdio: "ignore" });
  execFileSync("git", ["init"], { cwd: ignoredPath, stdio: "ignore" });
  writeFileSync(join(appPath, "package.json"), "{\"scripts\":{\"dev\":\"vite\"}}\n");
  writeFileSync(join(appPath, "vite.config.ts"), "export default {};\n");
  writeFileSync(join(rootRepoPath, "Cargo.toml"), "[package]\nname=\"tools\"\nversion=\"0.1.0\"\n");

  const plugin = new RepoLocalPlugin();
  const repos = await plugin.discover({
    repoCategoriesRoot: root,
    obsidianVaultPath: join(root, "vault"),
    codemeshRepoPath: root,
    githubOwner: "",
    gitlabBaseUrl: "https://gitlab.com",
    ignoredCategoryNames: ["node_modules"],
    maxGitStatusRepos: 25
  });

  assert.equal(repos.length, 2);
  assert.deepEqual(repos.map((repo) => repo.id).sort(), ["Apps/weather-app", "Root/tools"]);

  const app = repos.find((repo) => repo.name === "weather-app");
  assert.equal(app?.primaryLanguage, "JavaScript");
  assert.equal(app?.framework, "Vite");
  assert.equal(app?.packageManager, "npm");

  const rootRepo = repos.find((repo) => repo.name === "tools");
  assert.equal(rootRepo?.primaryLanguage, "Rust");
  assert.equal(rootRepo?.framework, "Rust CLI");
  assert.equal(rootRepo?.packageManager, "cargo");
});
