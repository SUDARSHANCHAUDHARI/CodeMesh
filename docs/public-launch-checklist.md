# Public Launch Checklist

This checklist tracks what must change before CodeMesh is ready for a public GitHub beta.

## Blockers

- [x] Replace hardcoded personal defaults in `src/core/config/types.ts`.
- [x] Replace hardcoded personal paths in `.codemesh/config.example.json` with portable example paths.
- [x] Rewrite README public quickstart so Sudarshan paths are examples, not required defaults.
- [x] Add public install, configuration, commands, and privacy docs.
- [x] Add CLI smoke checks for `--help`, `--version`, `plugins list`, and `doctor`.
- [x] Add local verification commands for build, typecheck, tests, smoke checks, and doctor.
- [x] Add `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- [x] Verify no generated `.codemesh/` outputs, indexes, capsules, memory, reports, dashboards, or usage logs are tracked.
- [x] Verify no real secrets, tokens, private keys, auth sessions, or local signing material are tracked.

## Before Public

- [x] Keep normal use local-first with no cloud dependency.
- [x] Keep Obsidian integration read-only.
- [x] Ensure optional GitHub/GitLab/Bitbucket providers are clearly documented as optional.
- [x] Ensure public docs explain what CodeMesh reads and what it writes under `.codemesh/`.
- [x] Confirm `pnpm build` passes.
- [x] Confirm `pnpm typecheck` passes.
- [x] Confirm `pnpm test:smoke` passes.
- [x] Confirm `pnpm dev doctor` passes.
- [x] Confirm local verification passes on `main`.
- [x] Confirm `git status -sb` is clean before tagging.

## Before v1.0 Tag

- [ ] Validate fresh-clone setup from `docs/install.md`.
- [ ] Decide whether public launch is GitHub-only or npm-published.
- [ ] If npm publishing is desired, remove `private: true` only after package metadata and `pnpm pack --dry-run` are clean.
- [ ] Add screenshots or terminal recordings only after command docs are stable.
- [ ] Review external plugin SDK boundaries and keep external code loading out unless intentionally included.

## Optional Later

- [ ] Hosted docs site.
- [ ] Richer knowledge graph visualization.
- [ ] Cross-platform test matrix for macOS, Linux, and Windows.
- [ ] npm package publishing.
- [ ] External plugin code loading and signed plugin policy.
- [ ] Live Notion, NotebookLM, and GitHub Wiki sync providers.
