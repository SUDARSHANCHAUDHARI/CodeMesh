import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import type { PluginManifest, RepositoryRecord } from "../plugins/types.js";
import type { RepositorySummary } from "../storage/sqlite-store.js";

export type ReportKind = "daily" | "weekly" | "release-notes" | "changelog";

export class ReportService {
  constructor(private readonly codemeshRepoPath: string) {}

  async generate(input: {
    kind: ReportKind;
    summary: RepositorySummary;
    dirtyRepositories: RepositoryRecord[];
    staleRepositories: RepositoryRecord[];
    plugins: PluginManifest[];
  }): Promise<string> {
    const reportsDir = join(this.codemeshRepoPath, ".codemesh", "reports");
    await mkdir(reportsDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const reportPath = join(reportsDir, `${date}-${input.kind}.md`);
    await writeFile(reportPath, renderReport(input), "utf8");
    return reportPath;
  }

  async generateRepositoryReport(input: {
    kind: "release-notes" | "changelog";
    repository: RepositoryRecord;
    commitLimit: number;
  }): Promise<string> {
    const reportsDir = join(this.codemeshRepoPath, ".codemesh", "reports");
    await mkdir(reportsDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const safeRepoName = input.repository.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const reportPath = join(reportsDir, `${date}-${safeRepoName}-${input.kind}.md`);
    const commits = await recentCommits(input.repository.path, input.commitLimit);
    await writeFile(reportPath, renderRepositoryReport(input.kind, input.repository, commits), "utf8");
    return reportPath;
  }

  async generatePrSummary(input: {
    repository: RepositoryRecord;
    githubOwner: string;
    limit: number;
  }): Promise<string> {
    const reportsDir = join(this.codemeshRepoPath, ".codemesh", "reports");
    await mkdir(reportsDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const safeRepoName = input.repository.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const reportPath = join(reportsDir, `${date}-${safeRepoName}-pr-summary.md`);
    const repoSlug = githubSlug(input.repository, input.githubOwner);
    const pullRequests = await githubPullRequests(repoSlug, input.limit);
    await writeFile(reportPath, renderPrSummary(input.repository, repoSlug, pullRequests), "utf8");
    return reportPath;
  }
}

function renderReport(input: {
  kind: ReportKind;
  summary: RepositorySummary;
  dirtyRepositories: RepositoryRecord[];
  staleRepositories: RepositoryRecord[];
  plugins: PluginManifest[];
}): string {
  const title = input.kind === "daily" ? "Daily CodeMesh Report" : "Weekly CodeMesh Report";
  const clean = input.summary.total - input.summary.dirty;
  const activePlugins = input.plugins.filter((plugin) => plugin.status === "active").length;
  const plannedPlugins = input.plugins.filter((plugin) => plugin.status === "planned").length;

  return `# ${title}

Generated: ${new Date().toISOString()}

## Portfolio Health

- Total repositories: ${input.summary.total}
- Clean repositories: ${clean}
- Dirty repositories: ${input.summary.dirty}
- Active plugins: ${activePlugins}
- Planned plugins: ${plannedPlugins}

## Categories

${countRows(input.summary.byCategory)}

## Languages

${countRows(input.summary.byLanguage)}

## Frameworks

${countRows(input.summary.byFramework)}

## Dirty Repositories

${repoRows(input.dirtyRepositories.slice(0, 25), "changed files")}

## Stale Repositories

${repoRows(input.staleRepositories.slice(0, 25), "last commit")}

## Plugin Registry

${input.plugins.map((plugin) => `- ${plugin.status}: ${plugin.kind}/${plugin.name} (${plugin.capabilities.join(", ")})`).join("\n")}
`;
}

function countRows(rows: Array<{ name: string; count: number }>): string {
  return rows.map((row) => `- ${row.name}: ${row.count}`).join("\n") || "- None";
}

function repoRows(repositories: RepositoryRecord[], detail: "changed files" | "last commit"): string {
  if (repositories.length === 0) {
    return "- None";
  }

  return repositories.map((repo) => {
    const value = detail === "changed files" ? String(repo.changedFileCount ?? 0) : repo.lastCommitDate?.slice(0, 10) ?? "unknown";
    return `- ${repo.category}/${repo.name}: ${value} ${detail} (${repo.path})`;
  }).join("\n");
}

function renderRepositoryReport(kind: "release-notes" | "changelog", repository: RepositoryRecord, commits: string[]): string {
  const title = kind === "release-notes" ? "Release Notes" : "Changelog";
  const sections = kind === "release-notes"
    ? [
      "## Highlights",
      commits.map((commit) => `- ${commit}`).join("\n") || "- No commits detected",
      "",
      "## Verification",
      "- Add release-specific checks before publishing."
    ]
    : [
      "## Changes",
      commits.map((commit) => `- ${commit}`).join("\n") || "- No commits detected"
    ];

  return `# ${title}: ${repository.name}

Generated: ${new Date().toISOString()}

Repository: ${repository.category}/${repository.name}
Path: ${repository.path}
Branch: ${repository.currentBranch ?? "unknown"}
Last indexed: ${repository.lastSeenAt}

${sections.join("\n")}
`;
}

interface PullRequestSummary {
  number: number;
  title: string;
  state: string;
  author?: {
    login?: string;
  };
  updatedAt?: string;
  url: string;
}

function renderPrSummary(repository: RepositoryRecord, repoSlug: string, pullRequests: PullRequestSummary[]): string {
  return `# PR Summary: ${repository.name}

Generated: ${new Date().toISOString()}

Repository: ${repository.category}/${repository.name}
GitHub: ${repoSlug}
Path: ${repository.path}

## Pull Requests

${pullRequests.map((pr) => {
  const author = pr.author?.login ?? "unknown";
  const updated = pr.updatedAt?.slice(0, 10) ?? "unknown";
  return `- #${pr.number} ${pr.title} [${pr.state}] by ${author}, updated ${updated} (${pr.url})`;
}).join("\n") || "- No open pull requests detected"}
`;
}

function githubSlug(repository: RepositoryRecord, fallbackOwner: string): string {
  const urlMatch = repository.path.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (urlMatch) {
    return `${urlMatch[1]}/${urlMatch[2]}`;
  }

  return `${fallbackOwner}/${repository.name}`;
}

function githubPullRequests(repoSlug: string, limit: number): Promise<PullRequestSummary[]> {
  return new Promise((resolve, reject) => {
    const child = spawn("gh", [
      "pr",
      "list",
      "--repo",
      repoSlug,
      "--state",
      "all",
      "--limit",
      String(Math.max(1, Math.floor(limit))),
      "--json",
      "number,title,state,author,updatedAt,url"
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
        reject(new Error(stderr || `gh pr list exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout) as PullRequestSummary[]);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function recentCommits(repoPath: string, limit: number): Promise<string[]> {
  return new Promise((resolve) => {
    const child = spawn("git", ["-C", repoPath, "log", `-${Math.max(1, Math.floor(limit))}`, "--pretty=format:%h %s"], {
      stdio: ["ignore", "pipe", "ignore"]
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.on("error", () => resolve([]));
    child.on("close", (code) => {
      if (code !== 0) {
        resolve([]);
        return;
      }

      resolve(stdout.split("\n").map((line) => line.trim()).filter(Boolean));
    });
  });
}
