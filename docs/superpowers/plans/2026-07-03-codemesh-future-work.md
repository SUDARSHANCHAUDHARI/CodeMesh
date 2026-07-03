# CodeMesh Future Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the optional future-vision work while keeping CodeMesh local-first, private-repo friendly, and useful for a solo developer with 200+ repositories.

**Architecture:** Keep the TypeScript CLI as the core app. Add local-first foundations before external integrations, and keep SaaS/cloud providers optional and read-only by default. Generated state stays under `.codemesh/`.

**Tech Stack:** TypeScript, Node.js, SQLite via local `sqlite3`, Markdown reports, static local HTML dashboard, authenticated CLI tools where available.

## Global Constraints

- Obsidian remains read-only unless explicitly approved later.
- No forced migration of existing repos or vault content.
- No cloud dependency for normal use.
- Do not commit `.codemesh/` generated files.
- Stage files explicitly by path.
- Verify focused changes with `pnpm build`, `pnpm typecheck`, and `pnpm dev doctor`.

---

## File Structure

- `src/core/usage/usage-service.ts`: local JSONL usage event writer, reader, and summary calculator.
- `src/core/app.ts`: app facade methods for usage log/list/summary and future providers.
- `src/cli/index.ts`: CLI commands for new usage, provider, graph, and automation workflows.
- `src/core/reports/report-service.ts`: Markdown reports for usage and future automation summaries.
- `src/core/dashboard/dashboard-service.ts`: dashboard sections for usage and future knowledge graph summaries.
- `src/plugins/*`: future first-party providers for GitLab, Bitbucket, Notion, NotebookLM, and GitHub Wiki.
- `docs/roadmap.md`: shipped milestone tracking.
- `docs/future-vision-status.md`: active/planned status updates.
- `README.md`: user-facing commands and boundaries.

## Phase 1: Local AI Usage Tracking

**Goal:** Track local AI usage manually first, without requiring API keys or integrations.

- [ ] Add `UsageService` in `src/core/usage/usage-service.ts` with:
  - `add({ agent, repo, task, tokensIn?, tokensOut?, costUsd? })`
  - `list(limit)`
  - `summary(days)`
- [ ] Store events as JSONL under `.codemesh/usage/events.jsonl`.
- [ ] Add CLI:
  - `codemesh usage add --agent <name> --task <text> [--repo <name>] [--tokens-in n] [--tokens-out n] [--cost-usd n]`
  - `codemesh usage list [--limit 20]`
  - `codemesh usage summary [--days 7]`
- [ ] Add README and roadmap docs.
- [ ] Verify:
  - `pnpm build`
  - `pnpm typecheck`
  - `pnpm dev doctor`
  - `node dist/cli/index.js usage add --agent Codex --task "Test event" --repo CodeMesh`
  - `node dist/cli/index.js usage list --limit 1`
  - `node dist/cli/index.js usage summary --days 30`
- [ ] Commit: `Add local AI usage tracking`

## Phase 2: Usage Reports And Dashboard

**Goal:** Make usage data visible in local reports and dashboard.

- [ ] Add `report usage-summary [--days 7]`.
- [ ] Add usage metrics to `dashboard generate`.
- [ ] Add docs and smoke tests.
- [ ] Commit: `Add usage reports and dashboard metrics`

## Phase 3: Knowledge Graph Foundation

**Goal:** Build a local graph export before adding graph UI complexity.

- [ ] Add graph node/edge generation from indexed repos, docs, memories, capsules, and usage events.
- [ ] Save graph JSON under `.codemesh/graph/graph.json`.
- [ ] Add `graph generate`, `graph summary`, and `graph search <query>`.
- [ ] Add dashboard graph summary section.
- [ ] Commit: `Add local knowledge graph foundation`

## Phase 4: Optional Remote Repository Providers

**Goal:** Add GitLab and Bitbucket as optional read-only providers.

- [ ] Add provider config fields without requiring credentials.
- [ ] Add GitLab provider using environment token only when present.
- [ ] Add Bitbucket provider using environment token only when present.
- [ ] Add `scan gitlab` and `scan bitbucket`.
- [ ] Keep provider failures non-fatal and actionable.
- [ ] Commit: `Add optional GitLab and Bitbucket providers`

## Phase 5: Optional Knowledge Providers

**Goal:** Add read-only knowledge provider stubs and import workflows.

- [ ] Add GitHub Wiki read-only provider for repos where wiki metadata is available.
- [ ] Add Notion import interface that reads exported Markdown/JSON from a local folder first.
- [ ] Add NotebookLM import interface that reads local exported notes first.
- [ ] Avoid live SaaS sync until the local import path is proven useful.
- [ ] Commit: `Add optional knowledge provider imports`

## Phase 6: Plugin SDK And Automation

**Goal:** Package extension points after the first-party interfaces settle.

- [ ] Document internal plugin interfaces as stable contracts.
- [ ] Add plugin discovery from a local `.codemesh/plugins` directory.
- [ ] Add plugin manifest validation.
- [ ] Add local automation definitions that generate commands/reports but do not schedule cloud jobs.
- [ ] Add docs for creating a provider plugin.
- [ ] Commit: `Add local plugin SDK foundation`

## Stop Rule

After Phase 1 and Phase 2, pause and use CodeMesh for real work before adding SaaS providers. The external provider phases should only proceed when there is a concrete need and available credentials or local exports.
