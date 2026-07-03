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
- Local AI usage tracking
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
pnpm dev repo category AIProjects --limit 20
pnpm dev repo language Kotlin --limit 20
pnpm dev repo framework Next.js --limit 20
pnpm dev repo source repo-github --limit 20
pnpm dev repo local-only --limit 20
pnpm dev repo remote-only --limit 20
pnpm dev repo duplicates --limit 20
pnpm dev repo compare --limit 20
pnpm dev repo compare --json
pnpm dev repo missing-local --limit 20
pnpm dev repo missing-remote --limit 20
pnpm dev repo clone-plan --limit 20
pnpm dev repo clone-plan --limit 5 --commands
pnpm dev repo show CodeMesh
pnpm dev repo path GitGet
pnpm dev repo open CodeMesh --dry-run
pnpm dev repo cd CodeMesh
pnpm dev repo dirty
pnpm dev repo stale --days 30
pnpm dev repo summary
pnpm dev dashboard generate
pnpm dev report daily
pnpm dev report weekly
pnpm dev report release-notes --repo CodeMesh
pnpm dev report changelog --repo CodeMesh
pnpm dev report pr-summary --repo CodeMesh
pnpm dev report repo-comparison
pnpm dev report usage-summary --days 7
pnpm dev capsule preview --repo CodeMesh --task "Plan the next task" --template codex
pnpm dev capsule create --repo CodeMesh --task "Plan the next task" --template neutral
pnpm dev capsule list
pnpm dev capsule show <filename>
pnpm dev memory add --type decision --repo CodeMesh --text "Keep Obsidian read-only."
pnpm dev memory list
pnpm dev memory show <filename>
pnpm dev usage add --agent Codex --repo CodeMesh --task "Plan the next task"
pnpm dev usage list --limit 20
pnpm dev usage summary --days 7
pnpm dev doctor
```

`repo search` includes lightweight metadata:

```text
category/name    language | framework | package-manager | branch | clean/dirty | last-commit-date    path
```

`repo category <name>` lists indexed repositories in an exact category, case-insensitively. Use `--limit <n>` to cap output.

`repo language <name>` lists indexed repositories by detected language. Use `unknown` for repos without a detected primary language. Use `--limit <n>` to cap output.

`repo framework <name>` lists indexed repositories by detected framework. Use `unknown` for repos without a detected framework. Use `--limit <n>` to cap output.

`repo source <name>` lists indexed repositories by provider, such as `repo-local` or `repo-github`. Use `--limit <n>` to cap output.

`repo local-only` and `repo remote-only` are shortcuts for local and GitHub provider filters.

`repo duplicates` finds repository names that appear in multiple providers, such as local plus GitHub overlap.

`repo compare` summarizes overlap between two providers and lists limited samples of overlapping, likely-matching, unresolved left-only, and unresolved right-only repositories. Likely matches catch name variants such as separator changes or `-main` suffixes. It defaults to `repo-local` compared with `repo-github`.

Use `repo compare --json` for scripts, reports, or future automation.

`repo missing-local` lists unresolved GitHub-only repositories. `repo missing-remote` lists unresolved local-only repositories.

`repo clone-plan` prints a dry-run clone plan for unresolved GitHub-only repositories: repo name, source URL, and proposed local destination. Add `--commands` to print reviewable `mkdir` and `git clone` commands. It does not clone anything.

`repo show <query>` prints the full indexed metadata for the first matching repository.

`repo path <query>` prints only the matched repository path for shell workflows.

`repo open <query>` opens the matched local path or remote URL with the system default app. Use `--dry-run` to print the target without opening it.

`repo cd <query>` prints a shell-safe `cd` command for the matched local repository.

`repo dirty` lists indexed repositories with local changes, sorted by changed file count.

`repo stale --days <n>` lists indexed repositories whose last commit is older than the threshold.

`repo summary` prints portfolio counts by category, source, language, and framework.

`capsule preview` prints the generated Markdown without writing a file. `capsule create` writes the same Markdown under `.codemesh/capsules/`.

`capsule list` shows generated capsules newest-first. `capsule show <filename>` prints a saved capsule.

`memory add`, `memory list`, and `memory show` manage local project, decision, architecture, prompt, and summary memory under `.codemesh/memory/`.

`usage add`, `usage list`, and `usage summary` track local AI usage events under `.codemesh/usage/`.

`doctor` checks configured local paths, the local SQLite index, the capsule output directory, `sqlite3` availability, and the read-only Obsidian policy.

`plugins list` shows active first-party plugins and planned future providers. Planned plugins are registry entries only until their local-first implementation is added.

`scan knowledge` detects Obsidian knowledge plus local repository Markdown docs without writing to any source.

`scan github` indexes read-only GitHub repository metadata through the authenticated `gh` CLI.

`dashboard generate` writes a local static dashboard to `.codemesh/dashboards/index.html` with portfolio counts, local/GitHub comparison, likely matches, usage metrics, provider overlap, recent repos, dirty repos, and plugin status.

`report daily` and `report weekly` write local Markdown reports to `.codemesh/reports/`.

`report release-notes` and `report changelog` generate local Markdown from recent commits in a matched repository.

`report pr-summary` generates local Markdown from GitHub pull requests using the authenticated `gh` CLI.

`report repo-comparison` saves the local/GitHub comparison, likely matches, and unresolved-only repositories as Markdown.

`report usage-summary` saves local AI usage totals and per-agent usage as Markdown.

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
