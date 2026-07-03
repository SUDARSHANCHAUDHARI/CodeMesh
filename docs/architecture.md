# Architecture

CodeMesh is a local-first TypeScript CLI that coordinates local repositories, knowledge sources, coding-agent instructions, context capsules, dashboards, and automation outputs.

The core stays small and stable. New agents, knowledge providers, repository providers, dashboards, and automations are represented as plugins. The current implementation uses first-party in-process plugins; external plugin loading should be added only after the local plugin contracts settle.

## Core Modules

- `config`: loads local paths and scan settings.
- `storage`: writes the lightweight SQLite index.
- `plugins`: defines plugin manifests and internal interfaces for repository, knowledge, agent, capsule, dashboard, and automation providers.
- `capsules`: creates portable Markdown context capsules.
- `cli`: exposes the command surface.

## First-Party Internal Plugins

- `repo-local`: discovers local Git repositories at `category/repo/.git` depth.
- `knowledge-obsidian`: detects existing Obsidian knowledge zones without editing them.
- `knowledge-markdown`: detects local repository Markdown documentation without editing it.
- `agent-claude`: detects `CLAUDE.md`.
- `agent-codex`: detects `CODEX.md` and `AGENTS.md`.
- `agent-local`: detects local instruction files for Gemini CLI, OpenCode, Aider, Amp, Cursor, and Windsurf.
- `capsule-markdown`: renders capsules as Markdown.

## Planned Plugin Families

- Repository sources: GitHub, GitLab, Bitbucket
- Knowledge sources: Notion, NotebookLM, GitHub Wiki, and richer local documentation providers
- Agents: dedicated Gemini CLI, OpenCode, Aider, Amp, Cursor, Windsurf, and future coding-agent providers
- Dashboards: active repositories, AI usage, activity, project health, repository health, knowledge graph
- Automation: daily summaries, weekly engineering reports, release notes, changelogs, PR summaries, architecture docs

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

- Cloud dependency
- Forced migration
- Writing to Obsidian without explicit approval
- External plugin execution before first-party contracts stabilize
