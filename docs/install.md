# Install

CodeMesh currently runs from source.

## Prerequisites

- Node.js 20 or newer
- pnpm
- git
- sqlite3
- GitHub CLI if you want optional GitHub scans or pull request summaries

## Clone And Build

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/CodeMesh.git
cd CodeMesh
pnpm install
pnpm build
```

## Run The CLI

```sh
node dist/cli/index.js --help
node dist/cli/index.js --version
```

Optional shell alias:

```sh
alias codemesh="node /path/to/CodeMesh/dist/cli/index.js"
```

## First Run

```sh
node dist/cli/index.js init \
  --repo-root /Users/you/code \
  --obsidian-vault /Users/you/notes/ObsidianVault \
  --codemesh-root /Users/you/code/CodeMesh \
  --github-owner your-github-user
```

Then check your setup:

```sh
node dist/cli/index.js doctor
```

Warnings mean an optional local path is not present yet. Fix warnings before using commands that depend on those paths.

## Verify A Fresh Checkout

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm test:smoke
```

Fresh-clone validation notes live in [fresh-clone-validation.md](fresh-clone-validation.md).
