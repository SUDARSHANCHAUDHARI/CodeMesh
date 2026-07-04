# NPM Publishing Decision

## Decision

CodeMesh stays source-run only for the `0.4.x` public beta line.

Do not publish to npm until the CLI has stronger automated test coverage and a clear installation support policy.

## Rationale

- The public beta is still validating command shape, config behavior, and local-first workflows.
- Source-run installation keeps the release reversible while the CLI stabilizes.
- npm publishing would create support expectations around package naming, global installs, upgrades, and backwards compatibility.
- `pnpm pack --dry-run` is already clean, so the repo can move toward npm later without changing the architecture.

## Revisit For v1.0

Revisit npm publishing when all are true:

- config, repository discovery, capsule generation, and provider behavior have focused tests
- macOS and Linux fresh-clone setup are verified
- README install instructions are stable
- release automation is repeatable
- package name and ownership are confirmed

## Current Install Path

Use source-run installation:

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/CodeMesh.git
cd CodeMesh
pnpm install
pnpm build
node dist/cli/index.js --help
```
