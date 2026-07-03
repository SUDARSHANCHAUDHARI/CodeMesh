# CodeMesh

CodeMesh is a local-first AI developer workspace for coordinating repositories, Obsidian knowledge, and coding agents.

## v0.3 Scope

- Single TypeScript CLI app
- First-party plugin registry
- Category-based local repository discovery
- Optional read-only GitHub repository discovery through `gh`
- Local Markdown knowledge discovery
- Top-level repo discovery under the repo category root
- SQLite index stored at `.codemesh/index.sqlite`
- Read-only Obsidian structure detection
- Claude/Codex instruction detection
- Gemini CLI, OpenCode, Aider, Amp, Cursor, and Windsurf instruction detection
- Markdown context capsules saved under `.codemesh/capsules/`
- Repo portfolio navigation commands
- Local dashboard generation
- Daily, weekly, release-note, and changelog reports
- Local project, decision, architecture, prompt, and summary memory
- Doctor health checks

## Commands

```sh
pnpm install
pnpm build
pnpm dev init
pnpm dev plugins list
pnpm dev scan repos
pnpm dev scan github
pnpm dev scan vault
pnpm dev scan knowledge
pnpm dev repo search CodeMesh
pnpm dev repo category AIProjects
pnpm dev repo language Kotlin
pnpm dev repo framework Next.js
pnpm dev repo show CodeMesh
pnpm dev repo path GitGet
pnpm dev repo dirty
pnpm dev repo stale --days 30
pnpm dev repo summary
pnpm dev dashboard generate
pnpm dev report daily
pnpm dev report weekly
pnpm dev report release-notes --repo CodeMesh
pnpm dev report changelog --repo CodeMesh
pnpm dev capsule preview --repo CodeMesh --task "Plan the next task" --template codex
pnpm dev capsule create --repo CodeMesh --task "Plan the next task" --template neutral
pnpm dev capsule list
pnpm dev capsule show <filename>
pnpm dev memory add --type decision --repo CodeMesh --text "Keep Obsidian read-only."
pnpm dev memory list
pnpm dev memory show <filename>
pnpm dev doctor
```

`repo search` includes lightweight metadata:

```text
category/name    language | framework | package-manager | branch | clean/dirty | last-commit-date    path
```

`repo category <name>` lists indexed repositories in an exact category, case-insensitively.

`repo language <name>` lists indexed repositories by detected language. Use `unknown` for repos without a detected primary language.

`repo framework <name>` lists indexed repositories by detected framework. Use `unknown` for repos without a detected framework.

`repo show <query>` prints the full indexed metadata for the first matching repository.

`repo path <query>` prints only the matched repository path for shell workflows.

`repo dirty` lists indexed repositories with local changes, sorted by changed file count.

`repo stale --days <n>` lists indexed repositories whose last commit is older than the threshold.

`repo summary` prints portfolio counts by category, language, and framework.

`capsule preview` prints the generated Markdown without writing a file. `capsule create` writes the same Markdown under `.codemesh/capsules/`.

`capsule list` shows generated capsules newest-first. `capsule show <filename>` prints a saved capsule.

`memory add`, `memory list`, and `memory show` manage local project, decision, architecture, prompt, and summary memory under `.codemesh/memory/`.

`doctor` checks configured local paths, the local SQLite index, the capsule output directory, `sqlite3` availability, and the read-only Obsidian policy.

`plugins list` shows active first-party plugins and planned future providers. Planned plugins are registry entries only until their local-first implementation is added.

`scan knowledge` detects Obsidian knowledge plus local repository Markdown docs without writing to any source.

`scan github` indexes read-only GitHub repository metadata through the authenticated `gh` CLI.

`dashboard generate` writes a local static dashboard to `.codemesh/dashboards/index.html`.

`report daily` and `report weekly` write local Markdown reports to `.codemesh/reports/`.

`report release-notes` and `report changelog` generate local Markdown from recent commits in a matched repository.

Capsule templates:

- `neutral`: portable context for any coding agent
- `codex`: adds Codex-focused inspection, AGENTS.md, scope, and verification guidance
- `claude`: adds Claude-focused CLAUDE.md, vault-boundary, and handoff guidance

Capsules also resolve known project memory folders when present, including `_RepoMem`, `_Projects`, `_Codex/Memories`, and `_Claude/Memories`. Obsidian remains read-only.

## Confirmed Local Paths

```text
Repo category root:
/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos

Obsidian vault:
/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/SudarshanObsidian

CodeMesh repo:
/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/CodeMesh
```

## Design Constraints

Obsidian integration is read-only for the MVP. CodeMesh must not write capsules or memory into the vault yet.

The MVP uses internal plugin interfaces only:

- `RepositorySourcePlugin`
- `KnowledgeSourcePlugin`
- `AgentPlugin`
- `CapsuleRendererPlugin`

External plugin SDK, dashboard, automation, Notion, NotebookLM, and cloud integrations are intentionally out of scope.
