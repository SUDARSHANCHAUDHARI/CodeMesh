import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { CapsuleService } from "../dist/core/capsules/capsule-service.js";
import { MarkdownCapsuleRenderer } from "../dist/plugins/capsule-markdown/markdown-capsule-renderer.js";

const repository = {
  id: "Apps/weather-app",
  name: "weather app",
  path: "/tmp/repos/Apps/weather app",
  category: "Apps",
  source: "repo-local",
  primaryLanguage: "TypeScript",
  framework: "Vite",
  packageManager: "pnpm",
  currentBranch: "main",
  hasChanges: false,
  changedFileCount: 0,
  lastCommitDate: "2026-07-04T00:00:00.000Z",
  activeStatus: "unknown",
  lastSeenAt: "2026-07-04T00:00:00.000Z"
};

test("capsule preview renders repository, knowledge, agent, and codex guidance", () => {
  const service = new CapsuleService("/tmp/codemesh", new MarkdownCapsuleRenderer());
  const markdown = service.preview({
    repository,
    task: "Plan the next change",
    template: "codex",
    knowledgeDocuments: [{
      title: "Architecture",
      path: "/tmp/notes/Architecture.md",
      source: "obsidian",
      projectHint: "weather app"
    }],
    agentProfiles: [{
      agentType: "codex",
      instructionFilePath: "/tmp/repos/Apps/weather app/AGENTS.md",
      scope: "repository"
    }]
  });

  assert.match(markdown, /# Context Capsule: weather app/);
  assert.match(markdown, /Plan the next change/);
  assert.match(markdown, /- Architecture \(obsidian\): \/tmp\/notes\/Architecture\.md/);
  assert.match(markdown, /- codex: \/tmp\/repos\/Apps\/weather app\/AGENTS\.md/);
  assert.match(markdown, /- Intended agent: Codex/);
});

test("capsule create writes a safe markdown filename and list returns history", async () => {
  const workspace = mkdtempSync(join(tmpdir(), "codemesh-capsule-"));
  const service = new CapsuleService(workspace, new MarkdownCapsuleRenderer());

  const capsulePath = await service.create({
    repository,
    task: "Create safe filename",
    template: "neutral",
    knowledgeDocuments: [],
    agentProfiles: []
  });

  assert.match(capsulePath, /weather-app\.md$/);
  assert.match(readFileSync(capsulePath, "utf8"), /Create safe filename/);

  const history = await service.list();
  assert.equal(history.length, 1);
  assert.equal(history[0].repositoryName, "weather-app");
});
