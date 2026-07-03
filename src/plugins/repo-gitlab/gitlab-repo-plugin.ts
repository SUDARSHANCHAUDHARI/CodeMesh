import type { CodeMeshConfig } from "../../core/config/types.js";
import type { RepositoryRecord, RepositorySourcePlugin } from "../../core/plugins/types.js";

interface GitLabProject {
  name: string;
  web_url: string;
  visibility: string;
  default_branch?: string;
  last_activity_at?: string;
}

export class GitLabRepoPlugin implements RepositorySourcePlugin {
  readonly name = "repo-gitlab";

  async discover(config: CodeMeshConfig): Promise<RepositoryRecord[]> {
    if (!config.gitlabGroup || !process.env.GITLAB_TOKEN) {
      return [];
    }

    const projects = await gitlabProjects(config.gitlabBaseUrl ?? "https://gitlab.com", config.gitlabGroup, process.env.GITLAB_TOKEN);
    const now = new Date().toISOString();

    return projects.map((project) => ({
      id: `GitLab/${project.name}`,
      name: project.name,
      path: project.web_url,
      category: "GitLab",
      source: this.name,
      currentBranch: project.default_branch,
      hasChanges: false,
      changedFileCount: 0,
      lastCommitDate: project.last_activity_at,
      activeStatus: project.visibility === "private" ? "active" : "unknown",
      lastSeenAt: now
    }));
  }
}

async function gitlabProjects(baseUrl: string, group: string, token: string): Promise<GitLabProject[]> {
  const encodedGroup = encodeURIComponent(group);
  const url = `${baseUrl.replace(/\/$/u, "")}/api/v4/groups/${encodedGroup}/projects?include_subgroups=true&per_page=100`;
  const response = await fetch(url, {
    headers: {
      "PRIVATE-TOKEN": token
    }
  });

  if (!response.ok) {
    throw new Error(`GitLab projects request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GitLabProject[]>;
}
