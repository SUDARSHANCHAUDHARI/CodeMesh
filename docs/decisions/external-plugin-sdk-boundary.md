# External Plugin SDK Boundary

## Decision

Do not add external plugin code loading before v1.0.

CodeMesh should keep using first-party in-process plugins until the core contracts have settled through real local usage.

## Stable Core

The core owns:

- configuration loading
- local generated storage under `.codemesh/`
- SQLite index schema
- CLI command routing
- safety policies around local-first behavior, Obsidian read-only behavior, and token handling
- report, dashboard, capsule, memory, usage, graph, and automation output locations

## Plugin Contracts

Plugin-like providers may implement these internal contracts:

- `RepositorySourcePlugin`
- `KnowledgeSourcePlugin`
- `AgentPlugin`
- `CapsuleRendererPlugin`

These contracts are internal for now. Public SDK stability requires dedicated versioning, tests, examples, and security policy.

## External SDK Requirements

Before external plugin loading exists, CodeMesh needs:

- manifest validation for declared permissions
- explicit local file access boundaries
- no implicit network access
- no token persistence in plugin config
- clear failure isolation so a plugin cannot break unrelated commands
- a signed or trusted-plugin policy
- fixtures proving a plugin can be added without modifying core command behavior

## v1.0 Position

For v1.0, prefer a documented manifest format and first-party plugins over arbitrary external code execution.
