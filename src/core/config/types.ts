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

export const DEFAULT_CONFIG: CodeMeshConfig = {
  repoCategoriesRoot: "/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos",
  obsidianVaultPath: "/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/SudarshanObsidian",
  codemeshRepoPath: "/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/CodeMesh",
  githubOwner: "SUDARSHANCHAUDHARI",
  gitlabBaseUrl: "https://gitlab.com",
  ignoredCategoryNames: [".agents", ".claude", ".git", "SudarshanObsidian"],
  maxGitStatusRepos: 25
};
