# CodeMesh Public Product Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare CodeMesh for a credible public v1.0 launch as a local-first AI developer workspace CLI.

**Architecture:** Keep CodeMesh as a single TypeScript CLI with a small stable core, first-party internal plugins, and local file-based outputs under `.codemesh/`. Public launch work should harden packaging, docs, tests, privacy, and examples before expanding runtime architecture.

**Tech Stack:** TypeScript, Node.js 20+, pnpm, SQLite via local `sqlite3` CLI, GitHub CLI for optional GitHub metadata, GitHub Actions for CI, Markdown docs, static HTML dashboard.

## Global Constraints

- Local-first remains the primary product promise.
- No cloud dependency for normal use.
- Obsidian stays read-only unless a later explicit feature changes that.
- Generated capsules, reports, dashboards, graph files, memory, usage events, and plugin manifests stay under `.codemesh/`.
- Do not commit local indexes, generated capsules, reports, dashboards, memory, usage logs, tokens, secrets, `.env*`, private keys, signing material, or auth/session files.
- Public launch must not expose Sudarshan-specific private paths as required defaults.
- Public docs may show Sudarshan paths only as clearly labeled examples.
- Stage files by explicit path only.
- Verify each code task with `pnpm build`, `pnpm typecheck`, and the narrowest relevant CLI smoke command.

---

## Launch Definition

Public launch means:

- A new user can understand what CodeMesh does in under 60 seconds.
- A new user can install or run it locally from the repo.
- A new user can initialize CodeMesh against their own repo root without editing source code.
- The repo can be made public without leaking private data, local generated state, or misleading personal defaults.
- CI proves the TypeScript CLI builds and basic commands work.
- Release notes, versioning, license, contribution boundaries, and security policy are present.

Public launch does not mean:

- Paid SaaS.
- Cloud sync.
- External plugin code execution.
- Obsidian writes.
- Full hosted dashboard.
- Multi-user accounts.

## File Structure

### Create

- `LICENSE`: product license, likely MIT unless a different license is chosen.
- `SECURITY.md`: vulnerability reporting and local-first privacy statement.
- `CONTRIBUTING.md`: lightweight contribution rules for a solo-maintained public repo.
- `CHANGELOG.md`: public release history starting at current private MVP state.
- `.github/workflows/ci.yml`: install, build, typecheck, and smoke tests.
- `.github/workflows/release.yml`: optional tag-driven package/archive verification.
- `docs/public-launch-checklist.md`: human checklist for flipping the repo public.
- `docs/install.md`: installation and first-run guide.
- `docs/configuration.md`: config keys, path examples, and privacy notes.
- `docs/commands.md`: public command reference.
- `docs/privacy.md`: what CodeMesh reads, writes, and never uploads.
- `docs/examples/index.md`: example workflows.
- `examples/basic/codemesh.config.example.json`: minimal portable config.
- `examples/basic/README.md`: small walkthrough for a non-Sudarshan workspace.
- `tests/smoke/cli-smoke.sh`: repeatable CLI smoke script.

### Modify

- `package.json`: public package metadata, scripts, files, license, repository, engines, and version decision.
- `README.md`: public positioning, install, quickstart, command examples, privacy promise, status, and roadmap link.
- `docs/architecture.md`: update planned versus active plugin boundaries for public users.
- `docs/roadmap.md`: public roadmap grouped by shipped, next, later.
- `docs/future-vision-status.md`: clarify private MVP versus public future vision.
- `AGENTS.md`: keep private workflow instructions useful, but ensure public repo docs are not dependent on them.
- `.gitignore`: verify generated `.codemesh/` outputs and secret files are ignored.
- `src/core/config/types.ts`: ensure config shape is public-friendly and documented.
- `src/core/config/config-manager.ts`: ensure init creates portable local config and does not force Sudarshan paths.
- `src/cli/index.ts`: add or refine `--version`, `--help`, `init`, `doctor`, and smoke-friendly command behavior if needed.

## Task 1: Public Readiness Audit

**Files:**
- Read: `README.md`
- Read: `package.json`
- Read: `.gitignore`
- Read: `src/core/config/config-manager.ts`
- Read: `src/core/config/types.ts`
- Create: `docs/public-launch-checklist.md`

**Interfaces:**
- Consumes: current repo contents.
- Produces: `docs/public-launch-checklist.md`, the source of truth for launch blockers.

- [ ] Run `git status -sb`.
- [ ] Run `rg -n "screencloudsudarshan|SUDARSHAN_CODE|SudarshanObsidian|sunny.sudarshan|sudarshantechlabs|GITLAB_TOKEN|BITBUCKET_TOKEN|token|secret|password|private key|BEGIN " .`.
- [ ] Run `git ls-files`.
- [ ] Confirm generated folders are not tracked: `.codemesh/`, `dist/`, `node_modules/`, `graphify-out/`.
- [ ] Create `docs/public-launch-checklist.md` with sections:
  - `Blockers`
  - `Before Public`
  - `Before v1.0 Tag`
  - `Optional Later`
- [ ] Add every real finding from the audit to the checklist.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Commit with `docs: add public launch checklist`.

## Task 2: Portable Configuration And Init

**Files:**
- Modify: `src/core/config/types.ts`
- Modify: `src/core/config/config-manager.ts`
- Modify: `src/cli/index.ts`
- Create: `examples/basic/codemesh.config.example.json`
- Create: `examples/basic/README.md`

**Interfaces:**
- Consumes: existing config load/init behavior.
- Produces: public-friendly config initialization that does not force personal paths.

- [ ] Add or confirm config fields are documented in code-level types:
  - `repoCategoriesRoot`
  - `obsidianVaultPath`
  - `codeMeshRepoPath`
  - `githubOwner`
  - `gitlabGroup`
  - `bitbucketWorkspace`
  - `notionImportPath`
  - `notebookLmImportPath`
  - `githubWikiImportPath`
- [ ] Ensure `codemesh init` can create a config using the current working directory and user-provided paths.
- [ ] Ensure no generated public config hardcodes `/Users/screencloudsudarshan/...` unless it is in example documentation labeled as Sudarshan's local setup.
- [ ] Create `examples/basic/codemesh.config.example.json` with placeholder paths:

```json
{
  "repoCategoriesRoot": "/Users/you/code",
  "obsidianVaultPath": "/Users/you/notes/ObsidianVault",
  "codeMeshRepoPath": "/Users/you/code/CodeMesh",
  "githubOwner": "your-github-user"
}
```

- [ ] Create `examples/basic/README.md` showing:
  - copy example config
  - run `pnpm build`
  - run `node dist/cli/index.js doctor`
  - run `node dist/cli/index.js scan repos`
  - run `node dist/cli/index.js repo search <query>`
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `node dist/cli/index.js doctor`.
- [ ] Commit with `feat: make configuration public friendly`.

## Task 3: CLI Help, Version, And Smoke Stability

**Files:**
- Modify: `src/cli/index.ts`
- Modify: `package.json`
- Create: `tests/smoke/cli-smoke.sh`

**Interfaces:**
- Consumes: existing command parser.
- Produces: stable public CLI smoke path.

- [ ] Add or verify `codemesh --help` prints core commands without requiring config.
- [ ] Add or verify `codemesh --version` prints `package.json` version.
- [ ] Make unknown commands return a non-zero exit code and a helpful message.
- [ ] Create `tests/smoke/cli-smoke.sh`:

```sh
#!/usr/bin/env sh
set -eu

node dist/cli/index.js --help >/dev/null
node dist/cli/index.js --version >/dev/null
node dist/cli/index.js plugins list >/dev/null
node dist/cli/index.js doctor >/dev/null
```

- [ ] Add script to `package.json`:

```json
"test:smoke": "pnpm build && sh tests/smoke/cli-smoke.sh"
```

- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test:smoke`.
- [ ] Commit with `test: add public CLI smoke checks`.

## Task 4: Public Package Metadata

**Files:**
- Modify: `package.json`
- Create: `LICENSE`
- Modify: `README.md`

**Interfaces:**
- Consumes: existing npm package metadata.
- Produces: package metadata suitable for public source distribution and possible npm publish.

- [ ] Choose launch version:
  - Use `0.4.0` for public beta.
  - Reserve `1.0.0` until install, docs, CI, and smoke usage are proven.
- [ ] Set `private` according to the launch decision:
  - keep `private: true` for public GitHub-only release.
  - remove `private` only when ready to publish to npm.
- [ ] Add package metadata:
  - `description`
  - `license`
  - `repository`
  - `bugs`
  - `homepage`
  - `keywords`
  - `engines.node`
  - `files`
- [ ] Create `LICENSE` using the chosen license text.
- [ ] Add README license/status badges only if they are accurate.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm pack --dry-run` if npm packaging is in scope.
- [ ] Commit with `chore: prepare public package metadata`.

## Task 5: Public Documentation Rewrite

**Files:**
- Modify: `README.md`
- Create: `docs/install.md`
- Create: `docs/configuration.md`
- Create: `docs/commands.md`
- Create: `docs/privacy.md`
- Modify: `docs/architecture.md`
- Modify: `docs/roadmap.md`
- Modify: `docs/future-vision-status.md`

**Interfaces:**
- Consumes: current private-MVP docs.
- Produces: complete public documentation for first-time users.

- [ ] Rewrite README with this structure:
  - What CodeMesh is
  - Who it is for
  - Local-first privacy promise
  - Current status
  - Install from source
  - Quickstart
  - Common workflows
  - Commands
  - Configuration
  - Roadmap
  - License
- [ ] Create `docs/install.md` covering:
  - prerequisites: Node 20+, pnpm, git, sqlite3
  - clone
  - install
  - build
  - run from source
  - optional shell alias
- [ ] Create `docs/configuration.md` covering every config key and whether it is required.
- [ ] Create `docs/commands.md` from the current command list in README, grouped by workflow.
- [ ] Create `docs/privacy.md` explaining:
  - what local paths are scanned
  - what `.codemesh/` stores
  - GitHub/GitLab/Bitbucket providers are optional
  - no cloud dependency
  - Obsidian is read-only
  - token environment variables are never written by CodeMesh
- [ ] Update architecture docs so public users understand internal plugins versus future external plugin SDK.
- [ ] Update roadmap to separate:
  - shipped
  - public beta hardening
  - v1.0
  - later
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Commit with `docs: prepare public launch documentation`.

## Task 6: CI For Public Confidence

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes: build/typecheck/smoke scripts.
- Produces: GitHub Actions status checks for every push and pull request.

- [ ] Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - name: Install sqlite3
        run: sudo apt-get update && sudo apt-get install -y sqlite3
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build
      - name: Typecheck
        run: pnpm typecheck
      - name: Smoke test
        run: pnpm test:smoke
```

- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test:smoke`.
- [ ] Push branch and verify CI passes on GitHub.
- [ ] Commit with `ci: add public launch checks`.

## Task 7: Security And Privacy Policies

**Files:**
- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Modify: `.gitignore`
- Modify: `docs/privacy.md`

**Interfaces:**
- Consumes: public docs from Task 5.
- Produces: clear public contribution and security boundaries.

- [ ] Create `SECURITY.md` with:
  - supported versions
  - report path
  - what counts as sensitive data
  - local-first security expectations
  - token handling expectations
- [ ] Create `CONTRIBUTING.md` with:
  - solo-maintainer note
  - issue style
  - pull request expectations
  - local verification commands
  - no secrets rule
- [ ] Verify `.gitignore` includes:

```gitignore
.codemesh/
dist/
node_modules/
.env
.env.*
*.pem
*.key
*.p12
*.mobileprovision
```

- [ ] Run `rg -n "BEGIN |PRIVATE KEY|GITLAB_TOKEN|BITBUCKET_TOKEN|password|secret|token" .`.
- [ ] Triage every hit:
  - docs examples are allowed only when they do not contain real values.
  - real secrets block launch.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Commit with `docs: add security and contribution policies`.

## Task 8: Release Notes And Changelog

**Files:**
- Create: `CHANGELOG.md`
- Modify: `docs/roadmap.md`
- Optional Create: `.github/workflows/release.yml`

**Interfaces:**
- Consumes: current git history and roadmap.
- Produces: public release narrative.

- [ ] Create `CHANGELOG.md` with:
  - `0.4.0 - Public Beta`
  - `0.3.0 - Private Local-First Foundation`
  - `0.2.0 - Repository Portfolio Tools`
  - `0.1.0 - MVP`
- [ ] For each version, list user-visible features, not every commit.
- [ ] Add unreleased section at top.
- [ ] Optional: create `.github/workflows/release.yml` that runs build/typecheck/smoke on tags matching `v*`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Commit with `docs: add public changelog`.

## Task 9: Public Beta Release Candidate

**Files:**
- Modify: `package.json`
- Modify: `CHANGELOG.md`
- Modify: `README.md`
- Modify: `docs/public-launch-checklist.md`

**Interfaces:**
- Consumes: Tasks 1-8.
- Produces: release candidate ready for final manual review.

- [ ] Set version to the chosen public beta version, likely `0.4.0`.
- [ ] Confirm README says public beta if version is below `1.0.0`.
- [ ] Mark launch checklist blockers as complete.
- [ ] Run:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test:smoke
pnpm dev doctor
```

- [ ] Run `git status -sb`.
- [ ] Commit with `chore: prepare public beta release`.
- [ ] Push `main`.

## Task 10: Make Repository Public

**Files:**
- No source files required unless GitHub metadata is tracked elsewhere.

**Interfaces:**
- Consumes: release candidate on GitHub.
- Produces: public GitHub repository.

- [ ] Confirm no blockers remain in `docs/public-launch-checklist.md`.
- [ ] Confirm GitHub default branch is `main`.
- [ ] Confirm GitHub Actions CI is passing.
- [ ] Confirm repo description:

```text
Local-first AI developer workspace for repositories, knowledge, and coding agents.
```

- [ ] Confirm topics:

```text
local-first, cli, typescript, ai-tools, developer-tools, obsidian, knowledge-graph, github-cli
```

- [ ] Flip repository visibility to public using GitHub UI or `gh repo edit --visibility public`.
- [ ] Create release tag:

```sh
git tag v0.4.0
git push origin v0.4.0
```

- [ ] Create GitHub release from `CHANGELOG.md`.
- [ ] Verify public clone in a temporary directory.

## Task 11: Post-Launch Polish

**Files:**
- Modify based on feedback.

**Interfaces:**
- Consumes: public beta feedback.
- Produces: v1.0 issue backlog and hardening tasks.

- [ ] Create GitHub issues for known non-blocking improvements.
- [ ] Add screenshots or terminal GIF only after docs are stable.
- [ ] Decide whether npm publishing is needed.
- [ ] Decide whether external plugin code loading is needed for v1.0.
- [ ] Decide whether hosted docs are needed.
- [ ] Decide whether CodeMesh should support macOS/Linux/Windows equally before v1.0.

## Recommended Execution Order

1. Public readiness audit.
2. Portable config and init.
3. CLI help/version/smoke.
4. Package metadata.
5. Public docs.
6. CI.
7. Security/privacy policies.
8. Changelog.
9. Public beta release candidate.
10. Make repo public.
11. Post-launch polish.

## Release Gate

Do not call the repo public-launch-ready until all are true:

- `git status -sb` is clean.
- Local `main` equals `origin/main`.
- GitHub Actions CI is green.
- `pnpm build` passes.
- `pnpm typecheck` passes.
- `pnpm test:smoke` passes.
- `pnpm dev doctor` passes.
- README quickstart works from a fresh clone.
- `.codemesh/` generated data is not tracked.
- Security scan finds no real secrets.
- Public docs do not require Sudarshan's private paths.
- `CHANGELOG.md`, `LICENSE`, `SECURITY.md`, and `CONTRIBUTING.md` exist.

## Self-Review

- Spec coverage: The plan covers packaging, docs, public config, tests, CI, privacy, security, changelog, release tagging, and public visibility.
- Placeholder scan: No launch task depends on TBD behavior; optional decisions are explicitly marked as optional.
- Type consistency: Config field names match the current README and plugin/provider names.
