import type { CodeMeshConfig } from "../../core/config/types.js";
import type { RepositoryRecord, RepositorySourcePlugin } from "../../core/plugins/types.js";

interface BitbucketRepository {
  name: string;
  links?: {
    html?: {
      href?: string;
    };
  };
  is_private?: boolean;
  updated_on?: string;
  mainbranch?: {
    name?: string;
  };
}

interface BitbucketRepositoryResponse {
  values?: BitbucketRepository[];
}

export class BitbucketRepoPlugin implements RepositorySourcePlugin {
  readonly name = "repo-bitbucket";

  async discover(config: CodeMeshConfig): Promise<RepositoryRecord[]> {
    if (!config.bitbucketWorkspace || !process.env.BITBUCKET_TOKEN) {
      return [];
    }

    const repositories = await bitbucketRepositories(config.bitbucketWorkspace, process.env.BITBUCKET_TOKEN);
    const now = new Date().toISOString();

    return repositories.map((repository) => ({
      id: `Bitbucket/${repository.name}`,
      name: repository.name,
      path: repository.links?.html?.href ?? `https://bitbucket.org/${config.bitbucketWorkspace}/${repository.name}`,
      category: "Bitbucket",
      source: this.name,
      currentBranch: repository.mainbranch?.name,
      hasChanges: false,
      changedFileCount: 0,
      lastCommitDate: repository.updated_on,
      activeStatus: repository.is_private ? "active" : "unknown",
      lastSeenAt: now
    }));
  }
}

async function bitbucketRepositories(workspace: string, token: string): Promise<BitbucketRepository[]> {
  const url = `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(workspace)}?pagelen=100`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Bitbucket repositories request failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.json() as BitbucketRepositoryResponse;
  return body.values ?? [];
}
