import { readFile, readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
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
      if (await exists(join(categoryPath, ".git"))) {
        repositories.push(await buildRepositoryRecord({
          category: "Root",
          name: category.name,
          path: categoryPath,
          source: this.name,
          now
        }));
      }

      const children = await readdir(categoryPath, { withFileTypes: true }).catch(() => []);

      for (const child of children) {
        if (!child.isDirectory()) {
          continue;
        }

        const repoPath = join(categoryPath, child.name);
        if (!(await exists(join(repoPath, ".git")))) {
          continue;
        }

        repositories.push(await buildRepositoryRecord({
          category: category.name,
          name: child.name,
          path: repoPath,
          source: this.name,
          now
        }));
      }
    }

    return repositories.sort((a, b) => a.id.localeCompare(b.id));
  }
}

async function buildRepositoryRecord(input: {
  category: string;
  name: string;
  path: string;
  source: string;
  now: string;
}): Promise<RepositoryRecord> {
  return {
    id: `${input.category}/${input.name}`,
    name: input.name,
    path: input.path,
    category: input.category,
    source: input.source,
    primaryLanguage: await detectPrimaryLanguage(input.path),
    framework: await detectFramework(input.path),
    packageManager: await detectPackageManager(input.path),
    ...(await detectGitMetadata(input.path)),
    activeStatus: "unknown",
    lastSeenAt: input.now
  };
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
  if (await exists(join(repoPath, "package.json"))) return "npm";
  if (await exists(join(repoPath, "gradlew"))) return "gradle";
  if (await exists(join(repoPath, "build.gradle.kts"))) return "gradle";
  if (await exists(join(repoPath, "build.gradle"))) return "gradle";
  if (await exists(join(repoPath, "Cargo.toml"))) return "cargo";
  return undefined;
}

async function detectPrimaryLanguage(repoPath: string): Promise<string | undefined> {
  if (await exists(join(repoPath, "Cargo.toml"))) return "Rust";
  if (await exists(join(repoPath, "build.gradle.kts"))) return "Kotlin";
  if (await exists(join(repoPath, "build.gradle"))) return "Kotlin";
  if (await exists(join(repoPath, "Package.swift"))) return "Swift";
  if (await exists(join(repoPath, "tsconfig.json"))) return "TypeScript";
  if (await exists(join(repoPath, "package.json"))) return "JavaScript";
  return undefined;
}

async function detectFramework(repoPath: string): Promise<string | undefined> {
  const rootBuildFile = await readFirstExistingFile([
    join(repoPath, "build.gradle.kts"),
    join(repoPath, "build.gradle")
  ]);
  const settingsFile = await readFirstExistingFile([
    join(repoPath, "settings.gradle.kts"),
    join(repoPath, "settings.gradle")
  ]);

  if (rootBuildFile.includes("kotlinMultiplatform") || rootBuildFile.includes("composeMultiplatform")) {
    return "KMP";
  }
  if (settingsFile.includes(":Platforms:Android") || settingsFile.includes(":androidApp")) {
    return "KMP";
  }
  if (await exists(join(repoPath, "app", "build.gradle.kts"))) return "Android";
  if (await exists(join(repoPath, "app", "build.gradle"))) return "Android";
  if (await exists(join(repoPath, "next.config.js"))) return "Next.js";
  if (await exists(join(repoPath, "next.config.mjs"))) return "Next.js";
  if (await exists(join(repoPath, "next.config.ts"))) return "Next.js";
  if (await exists(join(repoPath, "vite.config.ts"))) return "Vite";
  if (await exists(join(repoPath, "vite.config.js"))) return "Vite";
  if (await exists(join(repoPath, "Cargo.toml"))) return "Rust CLI";
  return undefined;
}

async function readFirstExistingFile(paths: string[]): Promise<string> {
  for (const path of paths) {
    try {
      return await readFile(path, "utf8");
    } catch {
      // Try the next conventional metadata file.
    }
  }

  return "";
}

async function detectGitMetadata(repoPath: string): Promise<{
  currentBranch?: string;
  hasChanges?: boolean;
  changedFileCount?: number;
  lastCommitDate?: string;
}> {
  const [branch, status, lastCommitDate] = await Promise.all([
    runGit(repoPath, ["branch", "--show-current"]),
    runGit(repoPath, ["status", "--porcelain"]),
    runGit(repoPath, ["log", "-1", "--format=%cI"])
  ]);

  const changedFiles = status.split("\n").filter(Boolean);
  return {
    currentBranch: branch.trim() || undefined,
    hasChanges: changedFiles.length > 0,
    changedFileCount: changedFiles.length,
    lastCommitDate: lastCommitDate.trim() || undefined
  };
}

function runGit(repoPath: string, args: string[]): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn("git", ["-C", repoPath, ...args], {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.on("error", () => {
      resolve("");
    });
    child.on("close", (code) => {
      resolve(code === 0 ? stdout : "");
    });
  });
}
