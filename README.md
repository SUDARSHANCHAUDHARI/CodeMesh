# CodeMesh

CodeMesh is a local-first AI developer workspace for people who manage many repositories, notes, and coding agents.

It indexes local Git repositories, reads existing knowledge sources, detects agent instruction files, and generates portable context capsules for tools like Codex and Claude. It keeps generated data in your local checkout under `.codemesh/`.

## Who It Is For

CodeMesh is useful if you:

- work across dozens or hundreds of repositories
- organize repos by category folders
- keep engineering notes in Obsidian or Markdown
- use multiple coding agents
- want quick repo search, local reports, and context handoffs without a cloud dependency

## Status

CodeMesh is currently a public-beta candidate. The core CLI is usable from source, but the external plugin SDK and hosted/cloud features are intentionally not part of the current release.

## Local-First Promise

- Normal use does not require a cloud service.
- Obsidian integration is read-only.
- Generated capsules, reports, dashboards, memory, usage logs, and graph files stay under `.codemesh/`.
- GitHub, GitLab, and Bitbucket scans are optional and read-only.
- CodeMesh does not store access tokens in its config.

See [docs/privacy.md](docs/privacy.md) for details.

## Requirements

- Node.js 20 or newer
- pnpm
- git
- sqlite3
- GitHub CLI only if you use `scan github` or PR summaries

## Install From Source

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/CodeMesh.git
cd CodeMesh
pnpm install
pnpm build
node dist/cli/index.js --help
```

Optional shell alias:

```sh
alias codemesh="node /path/to/CodeMesh/dist/cli/index.js"
```

## Quickstart

Create a local config:

```sh
node dist/cli/index.js init \
  --repo-root /Users/you/code \
  --obsidian-vault /Users/you/notes/ObsidianVault \
  --codemesh-root /Users/you/code/CodeMesh \
  --github-owner your-github-user
```

Check your setup:

```sh
node dist/cli/index.js doctor
```

Index local repositories:

```sh
node dist/cli/index.js scan repos
```

Search your portfolio:

```sh
node dist/cli/index.js repo search my-app
```

Create a context capsule:

```sh
node dist/cli/index.js capsule create --repo my-app --task "Plan the next change" --template codex
```

## Common Workflows

Find repositories quickly:

```sh
node dist/cli/index.js repo search CodeMesh
node dist/cli/index.js repo category AIProjects --limit 20
node dist/cli/index.js repo dirty
node dist/cli/index.js repo stale --days 30
```

Compare local and remote repository lists:

```sh
node dist/cli/index.js scan github
node dist/cli/index.js repo compare
node dist/cli/index.js repo clone-plan --commands
```

Generate local reports:

```sh
node dist/cli/index.js report daily
node dist/cli/index.js report weekly
node dist/cli/index.js report repo-comparison
```

Generate a local dashboard:

```sh
node dist/cli/index.js dashboard generate
```

## Documentation

- [Install](docs/install.md)
- [Configuration](docs/configuration.md)
- [Commands](docs/commands.md)
- [Privacy](docs/privacy.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Plugin manifest draft](docs/plugin-sdk.md)

## Development

```sh
pnpm build
pnpm typecheck
pnpm test:smoke
pnpm dev doctor
```

## License

MIT. See [LICENSE](LICENSE).
