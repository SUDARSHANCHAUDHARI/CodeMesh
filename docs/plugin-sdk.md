# Local Plugin SDK

CodeMesh supports local plugin manifests under `.codemesh/plugins/*.json`.

This is a manifest foundation, not dynamic code loading. The core remains stable and local-first while plugin contracts settle.

## Manifest Shape

```json
{
  "name": "my-provider",
  "kind": "knowledge-source",
  "status": "planned",
  "description": "Reads my local exported notes.",
  "capabilities": ["local-import", "read-only"]
}
```

## Commands

```sh
codemesh plugins list
codemesh plugins validate
```

`plugins list` includes built-in plugins plus valid local manifests.

`plugins validate` checks local manifests and prints `PASS` or `FAIL`.

## Boundaries

- Local manifests are ignored by Git.
- No external plugin code is executed.
- Providers should stay read-only until explicitly approved.
