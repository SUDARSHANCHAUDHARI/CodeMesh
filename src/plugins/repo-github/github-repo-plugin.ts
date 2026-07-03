import { spawn } from "node:child_process";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { RepositoryRecord, RepositorySourcePlugin } from "../../core/plugins/types.js";

interface GitHubRepository {
  name: string;
  url: string;
  isPrivate: boolean;
  updatedAt?: string;
  primaryLanguage?: {
    name?: string;
  };
  defaultBranchRef?: {
    name?: string;
  };
}

export class GitHubRepoPlugin implements RepositorySourcePlugin {
  readonly name = "repo-github";

  async discover(config: CodeMeshConfig): Promise<RepositoryRecord[]> {
    const repositories = await ghRepoList(config.githubOwner);
    const now = new Date().toISOString();

    return repositories.map((repo) => ({
      id: `GitHub/${repo.name}`,
      name: repo.name,
      path: repo.url,
      category: "GitHub",
      source: this.name,
      primaryLanguage: repo.primaryLanguage?.name,
      currentBranch: repo.defaultBranchRef?.name,
      hasChanges: false,
      changedFileCount: 0,
      lastCommitDate: repo.updatedAt,
      activeStatus: repo.isPrivate ? "active" : "unknown",
      lastSeenAt: now
    }));
  }
}

function ghRepoList(owner: string): Promise<GitHubRepository[]> {
  return new Promise((resolve, reject) => {
    const child = spawn("gh", [
      "repo",
      "list",
      owner,
      "--limit",
      "1000",
      "--json",
      "name,url,isPrivate,updatedAt,primaryLanguage,defaultBranchRef"
    ], {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `gh repo list exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout) as GitHubRepository[]);
      } catch (error) {
        reject(error);
      }
    });
  });
}
