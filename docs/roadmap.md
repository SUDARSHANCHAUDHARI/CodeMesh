# Roadmap

## MVP

- Initialize Git repo
- TypeScript CLI
- Config file
- Repo category discovery
- SQLite index
- Obsidian structure detection, read-only
- Claude/Codex instruction detection
- Markdown context capsule generation
- `doctor`
- `repo search`
- Basic docs

## v0.2

- Better language and framework detection
- Git branch/status indexing for selected repos
- Top-level Git repo discovery under the repo category root
- Search output with language, framework, package manager, branch, dirty status, and last commit date
- Repo category command for category-scoped navigation
- Repo language command for language-scoped navigation
- Repo framework command for framework-scoped navigation
- Repo source command for provider-scoped navigation
- `--limit` support for broad repo filter commands
- Repo local-only and remote-only shortcuts
- Repo duplicate detection across providers
- Repo provider comparison with overlap and missing-side counts
- Repo show command for full indexed metadata
- Repo path command for shell workflows
- Repo dirty command for local-change triage
- Repo stale command for age-based project review
- Repo summary command for portfolio counts
- Provider/source split in summaries, dashboard, and reports
- Doctor checks for configured paths, SQLite, capsules, and Obsidian read-only policy
- Capsule preview command
- Capsule history list/show commands
- Capsules include repo metadata, matching Obsidian references, and Claude/Codex instruction paths
- Capsule templates for `neutral`, `codex`, and `claude`
- Project memory resolver

## v0.3

- First-party plugin registry and `plugins list`
- Future vision status doc
- Optional read-only GitHub repository provider
- Local dashboard
- Static dashboard generator
- Daily and weekly Markdown report generator
- Release notes and changelog generator
- GitHub PR summary generator
- Local project/decision/architecture/prompt/summary memory commands
- Local multi-agent instruction detector
- Local Markdown knowledge provider
- Capsule history browser
- Stable plugin manifest draft
- GitHub read-only provider

## v1.0

- Plugin SDK
- Multi-agent launch workflows
- Knowledge graph view
- Daily and weekly reports
- Release and changelog generation
