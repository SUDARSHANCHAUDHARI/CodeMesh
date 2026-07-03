export interface CodeMeshConfig {
  repoCategoriesRoot: string;
  obsidianVaultPath: string;
  codemeshRepoPath: string;
  githubOwner: string;
  ignoredCategoryNames: string[];
  maxGitStatusRepos: number;
}

export const DEFAULT_CONFIG: CodeMeshConfig = {
  repoCategoriesRoot: "/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos",
  obsidianVaultPath: "/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/SudarshanObsidian",
  codemeshRepoPath: "/Users/screencloudsudarshan/SUDARSHAN_CODE/sudarshan_repos/CodeMesh",
  githubOwner: "SUDARSHANCHAUDHARI",
  ignoredCategoryNames: [".agents", ".claude", ".git", "SudarshanObsidian"],
  maxGitStatusRepos: 25
};
