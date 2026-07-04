# Fresh Clone Validation

## 2026-07-04

Validated a public clone on macOS from:

```text
https://github.com/SUDARSHANCHAUDHARI/CodeMesh.git
```

Commands:

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/CodeMesh.git /private/tmp/codemesh-public-clone-verify
cd /private/tmp/codemesh-public-clone-verify
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test:smoke
```

Result:

- install passed
- build passed
- typecheck passed
- smoke checks passed

Linux validation still needs a manual pass before broader platform support is claimed.

Recommended Linux validation commands:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:smoke`

Before v1.0, repeat this validation manually on a Linux machine if broader platform support becomes a release claim.
