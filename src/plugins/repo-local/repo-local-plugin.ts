import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { RepositoryRecord, RepositorySourcePlugin } from "../../core/plugins/types.js";

export class RepoLocalPlugin implements RepositorySourcePlugin {
  readonly name = "repo-local";

  async discover(config: CodeMeshConfig): Promise<RepositoryRecord[]> {
    const categories = await readdir(config.repoCategoriesRoot, { withFileTypes: true });
    const repositories: RepositoryRecord[] = [];
    const now = new Date().toISOString();

    for (const category of categories) {
      if (!category.isDirectory() || config.ignoredCategoryNames.includes(category.name)) {
        continue;
      }

      const categoryPath = join(config.repoCategoriesRoot, category.name);
      const children = await readdir(categoryPath, { withFileTypes: true }).catch(() => []);

      for (const child of children) {
        if (!child.isDirectory()) {
          continue;
        }

        const repoPath = join(categoryPath, child.name);
        if (!(await exists(join(repoPath, ".git")))) {
          continue;
        }

        repositories.push({
          id: `${category.name}/${child.name}`,
          name: child.name,
          path: repoPath,
          category: category.name,
          source: this.name,
          packageManager: await detectPackageManager(repoPath),
          activeStatus: "unknown",
          lastSeenAt: now
        });
      }
    }

    return repositories.sort((a, b) => a.id.localeCompare(b.id));
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function detectPackageManager(repoPath: string): Promise<string | undefined> {
  if (await exists(join(repoPath, "pnpm-lock.yaml"))) return "pnpm";
  if (await exists(join(repoPath, "yarn.lock"))) return "yarn";
  if (await exists(join(repoPath, "package-lock.json"))) return "npm";
  if (await exists(join(repoPath, "gradlew"))) return "gradle";
  if (await exists(join(repoPath, "Cargo.toml"))) return "cargo";
  return undefined;
}
