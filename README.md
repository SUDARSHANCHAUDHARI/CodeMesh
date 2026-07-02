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
pnpm dev capsule preview --repo CodeMesh --task "Plan the next task"
pnpm dev capsule create --repo CodeMesh --task "Plan the next task"
pnpm dev doctor
```

`repo search` includes lightweight metadata:

```text
category/name    language | framework | package-manager | branch | clean/dirty | last-commit-date    path
```

`capsule preview` prints the generated Markdown without writing a file. `capsule create` writes the same Markdown under `.codemesh/capsules/`.

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
