import { join } from "node:path";

export interface CodeMeshConfig {
  repoCategoriesRoot: string;
  obsidianVaultPath: string;
  codemeshRepoPath: string;
  githubOwner: string;
  gitlabBaseUrl?: string;
  gitlabGroup?: string;
  bitbucketWorkspace?: string;
  notionImportPath?: string;
  notebookLmImportPath?: string;
  githubWikiImportPath?: string;
  ignoredCategoryNames: string[];
  maxGitStatusRepos: number;
}

const currentWorkspace = process.cwd();

export const DEFAULT_CONFIG: CodeMeshConfig = {
  repoCategoriesRoot: currentWorkspace,
  obsidianVaultPath: join(currentWorkspace, "ObsidianVault"),
  codemeshRepoPath: currentWorkspace,
  githubOwner: "",
  gitlabBaseUrl: "https://gitlab.com",
  ignoredCategoryNames: [".agents", ".claude", ".git", "node_modules"],
  maxGitStatusRepos: 25
};
