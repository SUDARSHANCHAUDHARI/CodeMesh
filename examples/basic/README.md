# Basic CodeMesh Example

This example shows the smallest useful local setup for a personal workspace.

1. Copy `codemesh.config.example.json` into your CodeMesh checkout:

```sh
mkdir -p .codemesh
cp examples/basic/codemesh.config.example.json .codemesh/config.json
```

2. Edit the paths for your machine.

3. Build and check the CLI:

```sh
pnpm build
node dist/cli/index.js doctor
```

4. Index local repositories and search them:

```sh
node dist/cli/index.js scan repos
node dist/cli/index.js repo search CodeMesh
```

CodeMesh stores generated indexes, capsules, reports, dashboards, memory, usage logs, and graph files under `.codemesh/`.
