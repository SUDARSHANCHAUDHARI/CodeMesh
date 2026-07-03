#!/usr/bin/env node
import { CodeMeshApp } from "../core/app.js";
import type { CapsuleTemplate } from "../core/plugins/types.js";

const app = new CodeMeshApp();
const args = process.argv.slice(2);

try {
  await run(args);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function run(argv: string[]): Promise<void> {
  const [command, subcommand, ...rest] = argv;

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "init") {
    const configPath = await app.init();
    console.log(`Created config: ${configPath}`);
    return;
  }

  if (command === "scan" && subcommand === "repos") {
    const count = await app.scanRepos();
    console.log(`Indexed ${count} repositories.`);
    return;
  }

  if (command === "scan" && subcommand === "vault") {
    const count = await app.scanVault();
    console.log(`Detected ${count} Obsidian knowledge entries. No vault files were changed.`);
    return;
  }

  if (command === "repo" && subcommand === "search") {
    const query = rest.join(" ").trim();
    if (!query) {
      throw new Error("Usage: codemesh repo search <query>");
    }

    const repositories = await app.searchRepos(query);
    for (const repo of repositories) {
      const dirty = repo.hasChanges ? `dirty:${repo.changedFileCount ?? 0}` : "clean";
      const metadata = [
        repo.primaryLanguage ?? "unknown",
        repo.framework ?? "unknown",
        repo.packageManager ?? "unknown",
        repo.currentBranch ?? "no-branch",
        dirty,
        repo.lastCommitDate?.slice(0, 10) ?? "no-commit"
      ].join(" | ");

      console.log(`${repo.category}/${repo.name}\t${metadata}\t${repo.path}`);
    }
    return;
  }

  if (command === "repo" && subcommand === "show") {
    const query = rest.join(" ").trim();
    if (!query) {
      throw new Error("Usage: codemesh repo show <query>");
    }

    const repo = await app.showRepo(query);
    const dirty = repo.hasChanges ? `dirty (${repo.changedFileCount ?? 0} changed files)` : "clean";
    console.log([
      `Repository: ${repo.category}/${repo.name}`,
      `Path: ${repo.path}`,
      `Source: ${repo.source}`,
      `Language: ${repo.primaryLanguage ?? "unknown"}`,
      `Framework: ${repo.framework ?? "unknown"}`,
      `Package manager: ${repo.packageManager ?? "unknown"}`,
      `Branch: ${repo.currentBranch ?? "unknown"}`,
      `Status: ${dirty}`,
      `Last commit date: ${repo.lastCommitDate ?? "unknown"}`,
      `Active status: ${repo.activeStatus}`,
      `Last indexed: ${repo.lastSeenAt}`
    ].join("\n"));
    return;
  }

  if (command === "repo" && subcommand === "dirty") {
    const repositories = await app.dirtyRepos();
    for (const repo of repositories) {
      console.log(`${repo.changedFileCount ?? 0}\t${repo.category}/${repo.name}\t${repo.currentBranch ?? "no-branch"}\t${repo.path}`);
    }
    return;
  }

  if (command === "capsule" && subcommand === "create") {
    const repo = readFlag(rest, "--repo");
    const task = readFlag(rest, "--task");
    const template = readTemplate(rest);
    if (!repo || !task) {
      throw new Error('Usage: codemesh capsule create --repo <query> --task "<task>" [--template neutral|codex|claude]');
    }

    const capsulePath = await app.createCapsule(repo, task, template);
    console.log(`Created capsule: ${capsulePath}`);
    return;
  }

  if (command === "capsule" && subcommand === "preview") {
    const repo = readFlag(rest, "--repo");
    const task = readFlag(rest, "--task");
    const template = readTemplate(rest);
    if (!repo || !task) {
      throw new Error('Usage: codemesh capsule preview --repo <query> --task "<task>" [--template neutral|codex|claude]');
    }

    console.log(await app.previewCapsule(repo, task, template));
    return;
  }

  if (command === "capsule" && subcommand === "list") {
    const capsules = await app.listCapsules();
    for (const capsule of capsules) {
      console.log(`${capsule.createdAt}\t${capsule.repositoryName}\t${capsule.filename}`);
    }
    return;
  }

  if (command === "capsule" && subcommand === "show") {
    const filename = rest[0];
    if (!filename) {
      throw new Error("Usage: codemesh capsule show <filename>");
    }

    console.log(await app.showCapsule(filename));
    return;
  }

  if (command === "doctor") {
    const lines = await app.doctor();
    console.log(["CodeMesh doctor", ...lines].join("\n"));
    return;
  }

  throw new Error(`Unknown command: ${argv.join(" ")}`);
}

function readFlag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function readTemplate(args: string[]): CapsuleTemplate {
  const value = readFlag(args, "--template") ?? "neutral";
  if (value === "neutral" || value === "codex" || value === "claude") {
    return value;
  }

  throw new Error("Invalid template. Use one of: neutral, codex, claude");
}

function printHelp(): void {
  console.log(`CodeMesh

Usage:
  codemesh init
  codemesh scan repos
  codemesh scan vault
  codemesh repo search <query>
  codemesh repo show <query>
  codemesh repo dirty
  codemesh capsule create --repo <query> --task "<task>" [--template neutral|codex|claude]
  codemesh capsule preview --repo <query> --task "<task>" [--template neutral|codex|claude]
  codemesh capsule list
  codemesh capsule show <filename>
  codemesh doctor
`);
}
