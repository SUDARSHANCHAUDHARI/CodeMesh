# Architecture

CodeMesh MVP is a single TypeScript CLI app with internal plugin-style boundaries.

## Core Modules

- `config`: loads local paths and scan settings.
- `storage`: writes the lightweight SQLite index.
- `plugins`: defines internal interfaces for repository, knowledge, agent, and capsule providers.
- `capsules`: creates portable Markdown context capsules.
- `cli`: exposes the command surface.

## First-Party Internal Plugins

- `repo-local`: discovers local Git repositories at `category/repo/.git` depth.
- `knowledge-obsidian`: detects existing Obsidian knowledge zones without editing them.
- `agent-claude`: detects `CLAUDE.md`.
- `agent-codex`: detects `CODEX.md` and `AGENTS.md`.
- `capsule-markdown`: renders capsules as Markdown.

## Storage

The MVP stores index data in:

```text
.codemesh/index.sqlite
```

Generated capsules are stored in:

```text
.codemesh/capsules/
```

## Out of Scope

- External plugin SDK
- Dashboard
- Automation
- Notion
- NotebookLM
- Cloud sync
- Writing to Obsidian
