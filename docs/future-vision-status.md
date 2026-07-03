# Future Vision Status

CodeMesh is now a local-first foundation for the future vision. The implemented pieces are intentionally file-based, CLI-driven, and private-repo friendly.

## Active

- First-party plugin registry
- Local Git repository discovery
- Optional read-only GitHub repository discovery through `gh`
- Obsidian read-only detection
- Local Markdown documentation detection
- Claude and Codex instruction detection
- Local multi-agent instruction detection for Gemini CLI, OpenCode, Aider, Amp, Cursor, and Windsurf
- Context capsule preview/create/list/show
- Local static dashboard generation
- Daily and weekly Markdown reports
- Release notes and changelog generation from local Git commits
- Local project, decision, architecture, prompt, and summary memory
- Local AI usage tracking
- Usage reports and dashboard metrics

## Planned

- Dedicated remote repository providers for GitLab and Bitbucket
- Dedicated Notion, NotebookLM, and GitHub Wiki providers
- Knowledge graph dashboard
- PR summary generation from remote provider metadata
- External plugin loading and SDK packaging

## Boundaries

- Obsidian remains read-only.
- Generated outputs stay under `.codemesh/`.
- No cloud provider is required for normal local use.
- Planned cloud or SaaS integrations must remain optional plugins.
