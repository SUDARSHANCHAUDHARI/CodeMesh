#!/usr/bin/env node
import { CodeMeshApp } from "../core/app.js";
import type { MemoryKind } from "../core/memory/memory-service.js";
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

  if (command === "plugins" && subcommand === "list") {
    const plugins = app.listPlugins();
    for (const plugin of plugins) {
      console.log(`${plugin.status}\t${plugin.kind}\t${plugin.name}\t${plugin.capabilities.join(",")}`);
    }
    return;
  }

  if (command === "scan" && subcommand === "repos") {
    const count = await app.scanRepos();
    console.log(`Indexed ${count} repositories.`);
    return;
  }

  if (command === "scan" && subcommand === "github") {
    const count = await app.scanGitHubRepos();
    console.log(`Indexed ${count} GitHub repositories.`);
    return;
  }

  if (command === "scan" && subcommand === "vault") {
    const count = await app.scanVault();
    console.log(`Detected ${count} Obsidian knowledge entries. No vault files were changed.`);
    return;
  }

  if (command === "scan" && subcommand === "knowledge") {
    const count = await app.scanKnowledge();
    console.log(`Detected ${count} knowledge entries. No source files were changed.`);
    return;
  }

  if (command === "repo" && subcommand === "search") {
    const query = rest.join(" ").trim();
    if (!query) {
      throw new Error("Usage: codemesh repo search <query>");
    }

    const repositories = await app.searchRepos(query);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "category") {
    const category = positionalArgs(rest).join(" ").trim();
    const limit = readNumberFlag(rest, "--limit", 50);
    if (!category) {
      throw new Error("Usage: codemesh repo category <name> [--limit 50]");
    }

    const repositories = await app.categoryRepos(category, limit);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "language") {
    const language = positionalArgs(rest).join(" ").trim();
    const limit = readNumberFlag(rest, "--limit", 50);
    if (!language) {
      throw new Error("Usage: codemesh repo language <name> [--limit 50]");
    }

    const repositories = await app.languageRepos(language, limit);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "framework") {
    const framework = positionalArgs(rest).join(" ").trim();
    const limit = readNumberFlag(rest, "--limit", 50);
    if (!framework) {
      throw new Error("Usage: codemesh repo framework <name> [--limit 50]");
    }

    const repositories = await app.frameworkRepos(framework, limit);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "source") {
    const source = positionalArgs(rest).join(" ").trim();
    const limit = readNumberFlag(rest, "--limit", 50);
    if (!source) {
      throw new Error("Usage: codemesh repo source <name> [--limit 50]");
    }

    const repositories = await app.sourceRepos(source, limit);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "local-only") {
    const limit = readNumberFlag(rest, "--limit", 50);
    const repositories = await app.sourceRepos("repo-local", limit);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "remote-only") {
    const limit = readNumberFlag(rest, "--limit", 50);
    const repositories = await app.sourceRepos("repo-github", limit);
    printRepositoryRows(repositories);
    return;
  }

  if (command === "repo" && subcommand === "duplicates") {
    const limit = readNumberFlag(rest, "--limit", 50);
    const duplicateGroups = await app.duplicateRepos(limit);
    for (const group of duplicateGroups) {
      for (const repo of group.repositories) {
        console.log(`${group.name}\t${repo.source}\t${repo.category}/${repo.name}\t${repo.path}`);
      }
    }
    return;
  }

  if (command === "repo" && subcommand === "compare") {
    const leftSource = readFlag(rest, "--left") ?? "repo-local";
    const rightSource = readFlag(rest, "--right") ?? "repo-github";
    const limit = readNumberFlag(rest, "--limit", 20);
    const comparison = await app.compareRepoSources(leftSource, rightSource, limit);
    if (hasFlag(rest, "--json")) {
      console.log(JSON.stringify(comparison, null, 2));
      return;
    }

    printRepositoryComparison(comparison);
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

  if (command === "repo" && subcommand === "path") {
    const query = rest.join(" ").trim();
    if (!query) {
      throw new Error("Usage: codemesh repo path <query>");
    }

    const repo = await app.showRepo(query);
    console.log(repo.path);
    return;
  }

  if (command === "repo" && subcommand === "open") {
    const query = positionalArgs(rest).join(" ").trim();
    if (!query) {
      throw new Error("Usage: codemesh repo open <query> [--dry-run]");
    }

    const target = await app.openRepo(query, hasFlag(rest, "--dry-run"));
    console.log(target);
    return;
  }

  if (command === "repo" && subcommand === "dirty") {
    const repositories = await app.dirtyRepos();
    for (const repo of repositories) {
      console.log(`${repo.changedFileCount ?? 0}\t${repo.category}/${repo.name}\t${repo.currentBranch ?? "no-branch"}\t${repo.path}`);
    }
    return;
  }

  if (command === "repo" && subcommand === "stale") {
    const days = readNumberFlag(rest, "--days", 30);
    const repositories = await app.staleRepos(days);
    for (const repo of repositories) {
      console.log(`${repo.lastCommitDate?.slice(0, 10) ?? "no-commit"}\t${repo.category}/${repo.name}\t${repo.currentBranch ?? "no-branch"}\t${repo.path}`);
    }
    return;
  }

  if (command === "repo" && subcommand === "summary") {
    const summary = await app.repoSummary();
    console.log(`Total repositories: ${summary.total}`);
    console.log(`Dirty repositories: ${summary.dirty}`);
    printCountGroup("By category", summary.byCategory);
    printCountGroup("By source", summary.bySource);
    printCountGroup("By language", summary.byLanguage);
    printCountGroup("By framework", summary.byFramework);
    return;
  }

  if (command === "dashboard" && subcommand === "generate") {
    const dashboardPath = await app.generateDashboard();
    console.log(`Generated dashboard: ${dashboardPath}`);
    return;
  }

  if (command === "report" && (subcommand === "daily" || subcommand === "weekly")) {
    const reportPath = await app.generateReport(subcommand);
    console.log(`Generated report: ${reportPath}`);
    return;
  }

  if (command === "report" && (subcommand === "release-notes" || subcommand === "changelog")) {
    const repo = readFlag(rest, "--repo");
    const limit = readNumberFlag(rest, "--limit", 20);
    if (!repo) {
      throw new Error(`Usage: codemesh report ${subcommand} --repo <query> [--limit 20]`);
    }

    const reportPath = await app.generateRepositoryReport(subcommand, repo, limit);
    console.log(`Generated report: ${reportPath}`);
    return;
  }

  if (command === "report" && subcommand === "pr-summary") {
    const repo = readFlag(rest, "--repo");
    const limit = readNumberFlag(rest, "--limit", 20);
    if (!repo) {
      throw new Error("Usage: codemesh report pr-summary --repo <query> [--limit 20]");
    }

    const reportPath = await app.generatePrSummary(repo, limit);
    console.log(`Generated report: ${reportPath}`);
    return;
  }

  if (command === "report" && subcommand === "repo-comparison") {
    const leftSource = readFlag(rest, "--left") ?? "repo-local";
    const rightSource = readFlag(rest, "--right") ?? "repo-github";
    const limit = readNumberFlag(rest, "--limit", 25);
    const reportPath = await app.generateRepoComparisonReport(leftSource, rightSource, limit);
    console.log(`Generated report: ${reportPath}`);
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

  if (command === "memory" && subcommand === "add") {
    const kind = readMemoryKind(rest);
    const text = readFlag(rest, "--text");
    const repo = readFlag(rest, "--repo");
    if (!text) {
      throw new Error("Usage: codemesh memory add --type project|decision|architecture|prompt|summary --text <text> [--repo <name>]");
    }

    const memoryPath = await app.addMemory(kind, text, repo);
    console.log(`Created memory: ${memoryPath}`);
    return;
  }

  if (command === "memory" && subcommand === "list") {
    const entries = await app.listMemory();
    for (const entry of entries) {
      console.log(`${entry.createdAt}\t${entry.kind}\t${entry.filename}`);
    }
    return;
  }

  if (command === "memory" && subcommand === "show") {
    const filename = rest[0];
    if (!filename) {
      throw new Error("Usage: codemesh memory show <filename>");
    }

    console.log(await app.showMemory(filename));
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

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function readTemplate(args: string[]): CapsuleTemplate {
  const value = readFlag(args, "--template") ?? "neutral";
  if (value === "neutral" || value === "codex" || value === "claude") {
    return value;
  }

  throw new Error("Invalid template. Use one of: neutral, codex, claude");
}

function readMemoryKind(args: string[]): MemoryKind {
  const value = readFlag(args, "--type") ?? "project";
  if (value === "project" || value === "decision" || value === "architecture" || value === "prompt" || value === "summary") {
    return value;
  }

  throw new Error("Invalid memory type. Use one of: project, decision, architecture, prompt, summary");
}

function readNumberFlag(args: string[], name: string, defaultValue: number): number {
  const value = readFlag(args, name);
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive number.`);
  }

  return parsed;
}

function positionalArgs(args: string[]): string[] {
  const positional: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value?.startsWith("--")) {
      index += 1;
      continue;
    }

    if (value) {
      positional.push(value);
    }
  }

  return positional;
}

function printCountGroup(title: string, rows: Array<{ name: string; count: number }>): void {
  console.log(`\n${title}`);
  for (const row of rows) {
    console.log(`${row.count}\t${row.name}`);
  }
}

function printRepositoryRows(repositories: Awaited<ReturnType<CodeMeshApp["searchRepos"]>>): void {
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
}

function printRepositoryComparison(comparison: Awaited<ReturnType<CodeMeshApp["compareRepoSources"]>>): void {
  console.log(`Sources: ${comparison.leftSource} <-> ${comparison.rightSource}`);
  console.log(`${comparison.leftSource} total: ${comparison.leftTotal}`);
  console.log(`${comparison.rightSource} total: ${comparison.rightTotal}`);
  console.log(`Overlap: ${comparison.overlapTotal}`);
  console.log(`Likely matches: ${comparison.likelyMatchTotal}`);
  console.log(`Only ${comparison.leftSource}: ${comparison.leftOnlyTotal}`);
  console.log(`Only ${comparison.rightSource}: ${comparison.rightOnlyTotal}`);

  printComparisonRows(`Overlap sample`, comparison.overlap.flatMap((group) => group.repositories));
  printLikelyMatchRows("Likely match sample", comparison.likelyMatches);
  printComparisonRows(`Only ${comparison.leftSource}`, comparison.leftOnly);
  printComparisonRows(`Only ${comparison.rightSource}`, comparison.rightOnly);
}

function printLikelyMatchRows(title: string, matches: Awaited<ReturnType<CodeMeshApp["compareRepoSources"]>>["likelyMatches"]): void {
  console.log(`\n${title}`);
  for (const match of matches) {
    console.log([
      match.matchKey,
      match.left.source,
      `${match.left.category}/${match.left.name}`,
      match.right.source,
      `${match.right.category}/${match.right.name}`
    ].join("\t"));
  }
}

function printComparisonRows(title: string, repositories: Awaited<ReturnType<CodeMeshApp["searchRepos"]>>): void {
  console.log(`\n${title}`);
  for (const repo of repositories) {
    console.log(`${repo.source}\t${repo.category}/${repo.name}\t${repo.path}`);
  }
}

function printHelp(): void {
  console.log(`CodeMesh

Usage:
  codemesh init
  codemesh plugins list
  codemesh scan repos
  codemesh scan github
  codemesh scan vault
  codemesh scan knowledge
  codemesh repo search <query>
  codemesh repo category <name> [--limit 50]
  codemesh repo language <name> [--limit 50]
  codemesh repo framework <name> [--limit 50]
  codemesh repo source <name> [--limit 50]
  codemesh repo local-only [--limit 50]
  codemesh repo remote-only [--limit 50]
  codemesh repo duplicates [--limit 50]
  codemesh repo compare [--left repo-local] [--right repo-github] [--limit 20] [--json]
  codemesh repo show <query>
  codemesh repo path <query>
  codemesh repo open <query> [--dry-run]
  codemesh repo dirty
  codemesh repo stale [--days 30]
  codemesh repo summary
  codemesh dashboard generate
  codemesh report daily
  codemesh report weekly
  codemesh report release-notes --repo <query> [--limit 20]
  codemesh report changelog --repo <query> [--limit 20]
  codemesh report pr-summary --repo <query> [--limit 20]
  codemesh report repo-comparison [--left repo-local] [--right repo-github] [--limit 25]
  codemesh capsule create --repo <query> --task "<task>" [--template neutral|codex|claude]
  codemesh capsule preview --repo <query> --task "<task>" [--template neutral|codex|claude]
  codemesh capsule list
  codemesh capsule show <filename>
  codemesh memory add --type <kind> --text <text> [--repo <name>]
  codemesh memory list
  codemesh memory show <filename>
  codemesh doctor
`);
}
