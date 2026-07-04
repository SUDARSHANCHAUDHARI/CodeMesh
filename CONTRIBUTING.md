# Contributing

CodeMesh is currently solo-maintained and pre-1.0. Small focused issues and pull requests are easiest to review.

## Before Opening A Pull Request

Run:

```sh
pnpm build
pnpm typecheck
pnpm test:smoke
```

For behavior that depends on local paths, also run:

```sh
pnpm dev doctor
```

## Pull Request Expectations

- Keep changes focused.
- Prefer local-first behavior.
- Do not add a cloud dependency for normal use.
- Do not write to Obsidian unless the feature explicitly requires it and the policy has changed.
- Do not commit generated `.codemesh/` state.
- Do not commit `.env` files, tokens, keys, auth sessions, signing material, or private vault/repo content.
- Update docs when command behavior changes.

## Issues

Useful issues include:

- the command you ran
- what you expected
- what happened
- your OS and Node.js version
- sanitized config shape if relevant

Never paste real secrets or private note/repository contents into public issues.
