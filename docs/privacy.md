# Privacy

CodeMesh is designed for local-first use.

## What CodeMesh Reads

- Local Git repository folders under `repoCategoriesRoot`.
- Existing Obsidian vault structure when `obsidianVaultPath` is configured.
- Local Markdown documentation in repositories.
- Local exports from Notion, NotebookLM, or GitHub Wiki when configured.
- Agent instruction files such as `AGENTS.md`, `CODEX.md`, `CLAUDE.md`, and similar local files.
- Optional remote repository metadata when you explicitly run provider scans.

## What CodeMesh Writes

CodeMesh writes generated state under:

```text
.codemesh/
```

Generated state can include:

- `.codemesh/config.json`
- `.codemesh/index.sqlite`
- `.codemesh/capsules/`
- `.codemesh/dashboards/`
- `.codemesh/reports/`
- `.codemesh/memory/`
- `.codemesh/usage/`
- `.codemesh/graph/`
- `.codemesh/plugins/`

These files are local working data and should not be committed unless a specific example file is intentionally tracked.

## Obsidian Policy

Obsidian support is read-only. CodeMesh may inspect vault structure and Markdown metadata, but it does not write capsules, memory, reports, or generated files into your vault.

## Remote Providers

GitHub, GitLab, and Bitbucket support is optional and read-only.

- GitHub uses the authenticated `gh` CLI.
- GitLab reads `GITLAB_TOKEN` from the environment.
- Bitbucket reads `BITBUCKET_TOKEN` from the environment.

CodeMesh does not write these tokens into `.codemesh/config.json`.

## No Cloud Requirement

Normal CodeMesh workflows run locally. Cloud or SaaS integrations should remain optional provider plugins.
