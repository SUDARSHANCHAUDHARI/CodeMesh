# Commands

Run commands as `node dist/cli/index.js <command>` from the CodeMesh checkout, or through a shell alias named `codemesh`.

## Setup

```sh
codemesh init [--repo-root <path>] [--obsidian-vault <path>] [--codemesh-root <path>] [--github-owner <owner>]
codemesh doctor
codemesh --help
codemesh --version
```

## Plugins

```sh
codemesh plugins list
codemesh plugins validate
```

## Scans

```sh
codemesh scan repos
codemesh scan github
codemesh scan gitlab
codemesh scan bitbucket
codemesh scan vault
codemesh scan knowledge
```

## Repositories

```sh
codemesh repo search <query>
codemesh repo category <name> [--limit 50]
codemesh repo language <name> [--limit 50]
codemesh repo framework <name> [--limit 50]
codemesh repo source <name> [--limit 50]
codemesh repo local-only [--limit 50]
codemesh repo remote-only [--limit 50]
codemesh repo duplicates [--limit 50]
codemesh repo compare [--left repo-local] [--right repo-github] [--limit 20] [--json]
codemesh repo missing-local [--limit 50]
codemesh repo missing-remote [--limit 50]
codemesh repo clone-plan [--limit 50] [--category GitHubMissing] [--commands]
codemesh repo show <query>
codemesh repo path <query>
codemesh repo open <query> [--dry-run]
codemesh repo cd <query>
codemesh repo dirty
codemesh repo stale [--days 30]
codemesh repo summary
```

## Capsules

```sh
codemesh capsule preview --repo <query> --task "<task>" [--template neutral|codex|claude]
codemesh capsule create --repo <query> --task "<task>" [--template neutral|codex|claude]
codemesh capsule list
codemesh capsule show <filename>
```

Capsules are written under `.codemesh/capsules/`.

## Memory And Usage

```sh
codemesh memory add --type project|decision|architecture|prompt|summary --text <text> [--repo <name>]
codemesh memory list
codemesh memory show <filename>
codemesh usage add --agent <name> --task "<task>" [--repo <name>] [--tokens-in n] [--tokens-out n] [--cost-usd n]
codemesh usage list [--limit 20]
codemesh usage summary [--days 7]
```

## Reports, Dashboard, Graph, And Automation

```sh
codemesh dashboard generate
codemesh report daily
codemesh report weekly
codemesh report release-notes --repo <query> [--limit 20]
codemesh report changelog --repo <query> [--limit 20]
codemesh report pr-summary --repo <query> [--limit 20]
codemesh report repo-comparison [--left repo-local] [--right repo-github] [--limit 25]
codemesh report usage-summary [--days 7]
codemesh graph generate
codemesh graph summary
codemesh graph search <query>
codemesh automation plan daily|weekly
```

Automation commands print local command plans only. They do not schedule background jobs.
