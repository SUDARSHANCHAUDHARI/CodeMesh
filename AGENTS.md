# CodeMesh - Codex Instructions

## Project

CodeMesh is a local-first TypeScript CLI for indexing Sudarshan's repository categories, reading Obsidian structure, and generating context capsules for coding agents.

## Current MVP Scope

- Keep this as a single TypeScript CLI app.
- Use internal interfaces only; do not create an external plugin SDK yet.
- Obsidian integration is read-only.
- Generated capsules stay inside this repo under `.codemesh/capsules/`.
- Local index data stays inside this repo under `.codemesh/index.sqlite`.

## Boundaries

- Do not write to `/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/SudarshanObsidian` unless explicitly approved.
- Do not add dashboard, automation, Notion, NotebookLM, cloud sync, or external plugin work unless explicitly requested.
- Do not commit local config, generated capsules, SQLite indexes, secrets, `.env*`, signing material, or auth/session files.
- Stage files by explicit path only.

## Verification

Before claiming changes are done, run the narrowest relevant checks:

```sh
pnpm build
pnpm typecheck
pnpm dev doctor
```

For repository indexing changes, also run:

```sh
node dist/cli/index.js scan repos
node dist/cli/index.js repo search GitGet
```
