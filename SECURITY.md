# Security Policy

## Supported Versions

CodeMesh is pre-1.0. Security fixes are applied to the latest public branch and release candidate.

## Reporting A Vulnerability

Open a private security advisory on GitHub if available. If not, open an issue with minimal public detail and ask for a private follow-up path.

Do not include secrets, tokens, private keys, local auth sessions, private repository contents, or private note contents in public issues.

## Sensitive Data

Sensitive data includes:

- API tokens and access tokens
- SSH keys and private keys
- `.env` files
- local auth/session files
- signing certificates
- private repository contents
- private Obsidian vault contents
- generated `.codemesh/` indexes, capsules, memory, usage logs, reports, dashboards, and graph exports

## Local-First Expectations

CodeMesh is designed to run locally. Normal workflows do not require a cloud service.

Optional remote providers are read-only:

- GitHub uses the authenticated `gh` CLI.
- GitLab reads `GITLAB_TOKEN` from the environment.
- Bitbucket reads `BITBUCKET_TOKEN` from the environment.

CodeMesh should not write provider tokens into `.codemesh/config.json`.

## Maintainer Checklist

Before publishing a release:

```sh
rg -n "BEGIN |PRIVATE KEY|GITLAB_TOKEN|BITBUCKET_TOKEN|password|secret|token" .
pnpm build
pnpm typecheck
pnpm test:smoke
```
