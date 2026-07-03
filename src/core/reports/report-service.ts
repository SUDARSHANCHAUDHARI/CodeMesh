import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PluginManifest, RepositoryRecord } from "../plugins/types.js";
import type { RepositorySummary } from "../storage/sqlite-store.js";

export type ReportKind = "daily" | "weekly";

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
