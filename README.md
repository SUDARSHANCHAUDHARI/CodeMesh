# CodeMesh

CodeMesh is a local-first AI developer workspace for coordinating repositories, Obsidian knowledge, and coding agents.

## MVP Scope

- Single TypeScript CLI app
- Category-based local repository discovery
- SQLite index stored at `.codemesh/index.sqlite`
- Read-only Obsidian structure detection
- Claude/Codex instruction detection
- Markdown context capsules saved under `.codemesh/capsules/`
- Doctor command

## Commands

```sh
pnpm install
pnpm build
pnpm dev init
pnpm dev scan repos
pnpm dev scan vault
pnpm dev repo search CodeMesh
pnpm dev repo category AIProjects
pnpm dev repo language Kotlin
pnpm dev repo framework Next.js
pnpm dev repo show CodeMesh
pnpm dev repo dirty
pnpm dev repo stale --days 30
pnpm dev repo summary
pnpm dev capsule preview --repo CodeMesh --task "Plan the next task" --template codex
pnpm dev capsule create --repo CodeMesh --task "Plan the next task" --template neutral
pnpm dev capsule list
pnpm dev capsule show <filename>
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

`repo dirty` lists indexed repositories with local changes, sorted by changed file count.

`repo stale --days <n>` lists indexed repositories whose last commit is older than the threshold.

`repo summary` prints portfolio counts by category, language, and framework.

`capsule preview` prints the generated Markdown without writing a file. `capsule create` writes the same Markdown under `.codemesh/capsules/`.

`capsule list` shows generated capsules newest-first. `capsule show <filename>` prints a saved capsule.

`doctor` checks configured local paths, the local SQLite index, the capsule output directory, `sqlite3` availability, and the read-only Obsidian policy.

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
