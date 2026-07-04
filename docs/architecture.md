# Architecture

CodeMesh is a local-first TypeScript CLI that coordinates repositories, knowledge sources, coding-agent instructions, context capsules, reports, dashboards, and local automation plans.

The core stays small and stable. Current providers are first-party in-process plugins. External plugin code loading is intentionally deferred until the internal contracts are stable enough for public use.

## Core Modules

- `config`: loads `.codemesh/config.json` and public-safe defaults.
- `storage`: writes the lightweight SQLite repository index.
- `plugins`: defines internal provider contracts and plugin metadata.
- `capsules`: creates portable Markdown context capsules.
- `reports`: creates local Markdown reports.
- `dashboard`: creates a local static HTML dashboard.
- `graph`: exports a local knowledge graph.
- `memory`: manages local project, decision, architecture, prompt, and summary memory.
- `usage`: tracks local AI usage events.
- `automation`: prints local command plans.
- `cli`: exposes the command surface.

## First-Party Internal Plugins

- `repo-local`: discovers local Git repositories under category folders.
- `repo-github`: discovers GitHub repository metadata through the authenticated `gh` CLI.
- `repo-gitlab`: discovers GitLab repository metadata with `GITLAB_TOKEN`.
- `repo-bitbucket`: discovers Bitbucket repository metadata with `BITBUCKET_TOKEN`.
- `knowledge-obsidian`: detects existing Obsidian knowledge zones without editing them.
- `knowledge-markdown`: detects local repository Markdown documentation.
- `knowledge-imports`: reads local Notion, NotebookLM, and GitHub Wiki exports.
- `agent-claude`: detects `CLAUDE.md`.
- `agent-codex`: detects `CODEX.md` and `AGENTS.md`.
- `agent-local`: detects local instruction files for Gemini CLI, OpenCode, Aider, Amp, Cursor, and Windsurf.
- `capsule-markdown`: renders capsules as Markdown.

## Storage

Generated state lives under:

```text
.codemesh/
```

Important generated paths:

```text
.codemesh/index.sqlite
.codemesh/capsules/
.codemesh/reports/
.codemesh/dashboards/
.codemesh/memory/
.codemesh/usage/
.codemesh/graph/
```

## Boundaries

- No cloud dependency for normal use.
- No forced migration.
- No Obsidian writes.
- No external plugin execution before the plugin SDK is explicitly designed and reviewed.
- No token persistence in config.
