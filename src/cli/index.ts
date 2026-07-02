#!/usr/bin/env node
import { CodeMeshApp } from "../core/app.js";

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
      console.log(`${repo.category}/${repo.name}\t${repo.path}`);
    }
    return;
  }

  if (command === "capsule" && subcommand === "create") {
    const repo = readFlag(rest, "--repo");
    const task = readFlag(rest, "--task");
    if (!repo || !task) {
      throw new Error('Usage: codemesh capsule create --repo <query> --task "<task>"');
    }

    const capsulePath = await app.createCapsule(repo, task);
    console.log(`Created capsule: ${capsulePath}`);
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

function printHelp(): void {
  console.log(`CodeMesh

Usage:
  codemesh init
  codemesh scan repos
  codemesh scan vault
  codemesh repo search <query>
  codemesh capsule create --repo <query> --task "<task>"
  codemesh doctor
`);
}
