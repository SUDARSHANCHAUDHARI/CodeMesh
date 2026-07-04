# Configuration

CodeMesh reads local configuration from:

```text
.codemesh/config.json
```

Create it with:

```sh
node dist/cli/index.js init \
  --repo-root /Users/you/code \
  --obsidian-vault /Users/you/notes/ObsidianVault \
  --codemesh-root /Users/you/code/CodeMesh \
  --github-owner your-github-user
```

## Example

```json
{
  "repoCategoriesRoot": "/Users/you/code",
  "obsidianVaultPath": "/Users/you/notes/ObsidianVault",
  "codemeshRepoPath": "/Users/you/code/CodeMesh",
  "githubOwner": "your-github-user",
  "gitlabBaseUrl": "https://gitlab.com",
  "ignoredCategoryNames": [".agents", ".claude", ".git", "node_modules"],
  "maxGitStatusRepos": 25
}
```

## Keys

`repoCategoriesRoot`:
Root folder containing category folders and repositories. Required for local repo discovery.

`obsidianVaultPath`:
Existing Obsidian vault path. CodeMesh reads structure only and does not write to the vault.

`codemeshRepoPath`:
Path to the CodeMesh checkout. Generated local state is stored under this path in `.codemesh/`.

`githubOwner`:
GitHub owner or organization used by `scan github`.

`gitlabBaseUrl`:
GitLab instance URL. Defaults to `https://gitlab.com`.

`gitlabGroup`:
GitLab group path used by `scan gitlab`.

`bitbucketWorkspace`:
Bitbucket workspace used by `scan bitbucket`.

`notionImportPath`:
Path to a local Notion export folder. CodeMesh reads local files only.

`notebookLmImportPath`:
Path to a local NotebookLM export folder. CodeMesh reads local files only.

`githubWikiImportPath`:
Path to a local GitHub Wiki checkout or export folder.

`ignoredCategoryNames`:
Category folder names to skip during local repo discovery.

`maxGitStatusRepos`:
Maximum number of local repositories for expensive git status checks.

## Token-Based Providers

Optional remote providers use environment variables:

```sh
export GITLAB_TOKEN=...
export BITBUCKET_TOKEN=...
```

CodeMesh reads these values from the environment and does not write them to config.
