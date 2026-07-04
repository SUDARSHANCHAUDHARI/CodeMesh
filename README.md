# CodeMesh

[![CI](https://github.com/SUDARSHANCHAUDHARI/CodeMesh/actions/workflows/ci.yml/badge.svg)](https://github.com/SUDARSHANCHAUDHARI/CodeMesh/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SUDARSHANCHAUDHARI/CodeMesh?label=release)](https://github.com/SUDARSHANCHAUDHARI/CodeMesh/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](package.json)

CodeMesh is a local-first AI developer workspace for people who manage many repositories, local knowledge, and coding agents.

It indexes local Git repositories, reads existing knowledge sources, detects agent instruction files, and generates portable context capsules for tools like Codex and Claude. Generated data stays in your local checkout under `.codemesh/`.

## Current Status

- Current release: [`v0.4.0` public beta](https://github.com/SUDARSHANCHAUDHARI/CodeMesh/releases/tag/v0.4.0)
- Runtime: source-run TypeScript CLI
- Package publishing: not on npm yet; see [NPM publishing decision](docs/decisions/npm-publishing.md)
- Plugin SDK: internal first-party plugins only; see [external plugin SDK boundary](docs/decisions/external-plugin-sdk-boundary.md)
- Normal workflow: local-first, no cloud dependency

## Why CodeMesh Exists

CodeMesh is built for developers who have outgrown one-repo-at-a-time context management.

It helps when you:

- manage dozens or hundreds of repositories
- organize repositories by category folders
- keep project knowledge in Obsidian, Markdown, or local exports
- use multiple coding agents such as Codex, Claude, Gemini CLI, OpenCode, Aider, Amp, Cursor, or Windsurf
- need fast local repo search and portfolio visibility
- want reusable context capsules for agent handoff
- want daily/weekly local reports without committing private generated data

## What CodeMesh Does

### Repository Portfolio

- Discovers local Git repositories under category folders.
- Detects top-level repositories under the repo root.
- Indexes repository metadata into SQLite.
- Tracks source, category, language, framework, package manager, branch, dirty status, changed file count, and last commit date.
- Searches repositories by name, path, category, language, and framework.
- Finds dirty and stale repositories.
- Compares local repositories with optional remote metadata.
- Generates dry-run clone plans for remote repos missing locally.

### Knowledge Sources

- Reads Obsidian vault structure without writing to the vault.
- Reads local repository Markdown docs.
- Reads optional local exports from Notion, NotebookLM, and GitHub Wiki.
- Keeps knowledge detection local and file-based.

### Coding Agent Context

- Detects instruction files for:
  - Claude
  - Codex
  - Gemini CLI
  - OpenCode
  - Aider
  - Amp
  - Cursor
  - Windsurf
- Generates Markdown context capsules with repository metadata, relevant knowledge paths, agent instruction paths, and task guidance.
- Supports capsule templates:
  - `neutral`
  - `codex`
  - `claude`

### Local Reports And Dashboard

- Generates daily and weekly Markdown reports.
- Generates release notes and changelogs from local Git history.
- Generates GitHub PR summaries through the authenticated `gh` CLI.
- Generates repository comparison reports.
- Tracks local AI usage events.
- Exports a local knowledge graph.
- Generates a static local dashboard under `.codemesh/dashboards/`.

### Local Memory

CodeMesh can store local Markdown memory under `.codemesh/memory/` for:

- project memory
- decision memory
- architecture memory
- prompt history
- conversation summaries

## Local-First Promise

- Normal use does not require a cloud service.
- Obsidian integration is read-only.
- Generated capsules, reports, dashboards, memory, usage logs, graph exports, plugin manifests, and indexes stay under `.codemesh/`.
- GitHub, GitLab, and Bitbucket scans are optional and read-only.
- CodeMesh reads GitLab and Bitbucket tokens from environment variables only.
- CodeMesh does not store access tokens in `.codemesh/config.json`.

See [Privacy](docs/privacy.md) and [Security](SECURITY.md) for details.

## Requirements

- Node.js 20 or newer
- pnpm
- git
- sqlite3
- GitHub CLI only for `scan github` and GitHub PR summaries
- `GITLAB_TOKEN` only for `scan gitlab`
- `BITBUCKET_TOKEN` only for `scan bitbucket`

## Install From Source

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/CodeMesh.git
cd CodeMesh
pnpm install
pnpm build
node dist/cli/index.js --help
```

Optional shell alias:

```sh
alias codemesh="node /path/to/CodeMesh/dist/cli/index.js"
```

After adding the alias, examples can use `codemesh` instead of `node dist/cli/index.js`.

## Quickstart

Create a local config:

```sh
node dist/cli/index.js init \
  --repo-root /Users/you/code \
  --obsidian-vault /Users/you/notes/ObsidianVault \
  --codemesh-root /Users/you/code/CodeMesh \
  --github-owner your-github-user
```

Check your setup:

```sh
node dist/cli/index.js doctor
```

Index local repositories:

```sh
node dist/cli/index.js scan repos
```

Search your repositories:

```sh
node dist/cli/index.js repo search my-app
```

Create a Codex context capsule:

```sh
node dist/cli/index.js capsule create --repo my-app --task "Plan the next change" --template codex
```

Generate a local dashboard:

```sh
node dist/cli/index.js dashboard generate
```

## Configuration

CodeMesh reads local configuration from:

```text
.codemesh/config.json
```

Example:

```json
{
  "repoCategoriesRoot": "/Users/you/code",
  "obsidianVaultPath": "/Users/you/notes/ObsidianVault",
  "codemeshRepoPath": "/Users/you/code/CodeMesh",
  "githubOwner": "your-github-user",
  "gitlabBaseUrl": "https://gitlab.com",
  "ignoredCategoryNames": [".agents", ".claude", ".git", "node_modules"],
  "maxGitStatusRepos": 25
}
```

Important config keys:

- `repoCategoriesRoot`: root folder containing category folders and repositories
- `obsidianVaultPath`: existing Obsidian vault path, read-only
- `codemeshRepoPath`: path to the CodeMesh checkout
- `githubOwner`: GitHub owner or organization for `scan github`
- `gitlabBaseUrl`: GitLab instance URL, defaulting to `https://gitlab.com`
- `gitlabGroup`: GitLab group path for `scan gitlab`
- `bitbucketWorkspace`: Bitbucket workspace for `scan bitbucket`
- `notionImportPath`: local Notion export folder
- `notebookLmImportPath`: local NotebookLM export folder
- `githubWikiImportPath`: local GitHub Wiki checkout or export folder
- `ignoredCategoryNames`: category folder names to skip
- `maxGitStatusRepos`: cap for expensive local Git status checks

See [Configuration](docs/configuration.md) for the full reference.

## Repository Layout Expected By Local Discovery

CodeMesh is optimized for category-based repository folders:

```text
/Users/you/code/
  AndroidApps/
    WeatherApp/
      .git/
    NotesApp/
      .git/
  WebApps/
    Dashboard/
      .git/
  Tools/
    CodeMesh/
      .git/
```

It also detects repositories that live directly under `repoCategoriesRoot`.

## Command Reference

Run commands as:

```sh
node dist/cli/index.js <command>
```

Or, with the alias:

```sh
codemesh <command>
```

### Setup

```sh
codemesh init [--repo-root <path>] [--obsidian-vault <path>] [--codemesh-root <path>] [--github-owner <owner>]
codemesh doctor
codemesh --help
codemesh --version
```

### Plugins

```sh
codemesh plugins list
codemesh plugins validate
```

### Scans

```sh
codemesh scan repos
codemesh scan github
codemesh scan gitlab
codemesh scan bitbucket
codemesh scan vault
codemesh scan knowledge
```

### Repositories

```sh
codemesh repo search <query>
codemesh repo category <name> [--limit 50]
codemesh repo language <name> [--limit 50]
codemesh repo framework <name> [--limit 50]
codemesh repo source <name> [--limit 50]
codemesh repo local-only [--limit 50]
codemesh repo remote-only [--limit 50]
codemesh repo duplicates [--limit 50]
codemesh repo compare [--left repo-local] [--right repo-github] [--limit 20] [--json]
codemesh repo missing-local [--limit 50]
codemesh repo missing-remote [--limit 50]
codemesh repo clone-plan [--limit 50] [--category GitHubMissing] [--commands]
codemesh repo show <query>
codemesh repo path <query>
codemesh repo open <query> [--dry-run]
codemesh repo cd <query>
codemesh repo dirty
codemesh repo stale [--days 30]
codemesh repo summary
```

### Capsules

```sh
codemesh capsule preview --repo <query> --task "<task>" [--template neutral|codex|claude]
codemesh capsule create --repo <query> --task "<task>" [--template neutral|codex|claude]
codemesh capsule list
codemesh capsule show <filename>
```

Capsules are written under:

```text
.codemesh/capsules/
```

### Memory And Usage

```sh
codemesh memory add --type project|decision|architecture|prompt|summary --text <text> [--repo <name>]
codemesh memory list
codemesh memory show <filename>
codemesh usage add --agent <name> --task "<task>" [--repo <name>] [--tokens-in n] [--tokens-out n] [--cost-usd n]
codemesh usage list [--limit 20]
codemesh usage summary [--days 7]
```

### Reports, Dashboard, Graph, And Automation

```sh
codemesh dashboard generate
codemesh report daily
codemesh report weekly
codemesh report release-notes --repo <query> [--limit 20]
codemesh report changelog --repo <query> [--limit 20]
codemesh report pr-summary --repo <query> [--limit 20]
codemesh report repo-comparison [--left repo-local] [--right repo-github] [--limit 25]
codemesh report usage-summary [--days 7]
codemesh graph generate
codemesh graph summary
codemesh graph search <query>
codemesh automation plan daily|weekly
```

Automation commands print local command plans only. They do not schedule background jobs.

## Common Workflows

### Find A Repository Quickly

```sh
codemesh scan repos
codemesh repo search CodeMesh
codemesh repo path CodeMesh
codemesh repo cd CodeMesh
```

### Review Local Portfolio Health

```sh
codemesh repo summary
codemesh repo dirty
codemesh repo stale --days 30
codemesh report daily
codemesh dashboard generate
```

### Compare Local And GitHub Repositories

```sh
codemesh scan repos
codemesh scan github
codemesh repo compare
codemesh repo missing-local
codemesh repo clone-plan --commands
codemesh report repo-comparison
```

### Prepare Agent Context

```sh
codemesh scan repos
codemesh scan knowledge
codemesh capsule preview --repo my-app --task "Fix the failing build" --template codex
codemesh capsule create --repo my-app --task "Fix the failing build" --template codex
```

### Track Local AI Usage

```sh
codemesh usage add --agent Codex --repo CodeMesh --task "Refactor repo search" --tokens-in 12000 --tokens-out 1800
codemesh usage summary --days 7
codemesh report usage-summary --days 7
```

## Generated Files

Generated local state is intentionally ignored by Git.

```text
.codemesh/config.json
.codemesh/index.sqlite
.codemesh/capsules/
.codemesh/dashboards/
.codemesh/reports/
.codemesh/memory/
.codemesh/usage/
.codemesh/graph/
.codemesh/plugins/
```

The tracked example config lives at:

```text
.codemesh/config.example.json
```

## Architecture

CodeMesh is a single TypeScript CLI app with a small core and first-party in-process plugins.

Core modules:

- `config`: loads `.codemesh/config.json` and public-safe defaults
- `storage`: writes the SQLite repository index
- `plugins`: defines internal provider contracts and plugin metadata
- `capsules`: creates Markdown context capsules
- `reports`: creates local Markdown reports
- `dashboard`: creates the local static dashboard
- `graph`: exports a local knowledge graph
- `memory`: manages local Markdown memory
- `usage`: tracks local AI usage events
- `automation`: prints local command plans
- `cli`: exposes the command surface

First-party plugin families:

- repository sources: local Git, GitHub, GitLab, Bitbucket
- knowledge sources: Obsidian, local Markdown, local imports
- agent detectors: Claude, Codex, Gemini CLI, OpenCode, Aider, Amp, Cursor, Windsurf
- capsule renderer: Markdown

See [Architecture](docs/architecture.md) for details.

## Development

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm test:smoke
pnpm dev doctor
```

`pnpm test` runs Node's built-in test runner against compiled output. Current focused coverage includes config initialization, local repo discovery, and capsule rendering/history.

## CI And Release Verification

GitHub Actions run:

- install
- build
- typecheck
- unit tests
- smoke tests

Release tags also run package preview with:

```sh
pnpm pack --dry-run
```

## Public Beta Scope

Included in `0.4.0`:

- local repository portfolio indexing
- read-only knowledge detection
- multi-agent instruction detection
- context capsule generation
- local reports, dashboard, memory, usage, graph, and automation plans
- public docs, CI, smoke tests, and focused unit tests

Out of scope for the current public beta:

- npm publishing
- hosted/cloud service
- Obsidian writes
- external plugin code loading
- signed plugin policy
- Windows support guarantee

## Roadmap

Shipped:

- TypeScript CLI
- local config
- SQLite index
- repository discovery/search/compare
- read-only Obsidian and Markdown knowledge detection
- context capsules
- local reports/dashboard/memory/usage/graph
- optional read-only remote metadata providers

Later:

- npm publishing decision for v1.0
- external plugin SDK
- richer knowledge graph visualization
- live sync providers for Notion, NotebookLM, and GitHub Wiki
- broader cross-platform hardening

See [Roadmap](docs/roadmap.md) and [Post-launch backlog](docs/post-launch-backlog.md).

## Documentation

- [Install](docs/install.md)
- [Configuration](docs/configuration.md)
- [Commands](docs/commands.md)
- [Privacy](docs/privacy.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Fresh clone validation](docs/fresh-clone-validation.md)
- [Plugin manifest draft](docs/plugin-sdk.md)
- [NPM publishing decision](docs/decisions/npm-publishing.md)
- [External plugin SDK boundary](docs/decisions/external-plugin-sdk-boundary.md)
- [Changelog](CHANGELOG.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Security

Do not commit generated `.codemesh/` data, `.env` files, tokens, private keys, auth sessions, signing material, private repository contents, or private vault contents.

See [Security Policy](SECURITY.md).

## Contributing

CodeMesh is solo-maintained and pre-1.0. Small focused issues and pull requests are easiest to review.

Before opening a pull request, run:

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm test:smoke
```

See [Contributing](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
