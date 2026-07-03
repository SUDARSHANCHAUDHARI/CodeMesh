import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PluginManifest, RepositoryRecord } from "../plugins/types.js";
import type {
  RepositoryDuplicate,
  RepositorySourceComparison,
  RepositorySummary
} from "../storage/sqlite-store.js";

export class DashboardService {
  constructor(private readonly codemeshRepoPath: string) {}

  async generate(input: {
    summary: RepositorySummary;
    repositories: RepositoryRecord[];
    duplicateRepositories: RepositoryDuplicate[];
    sourceComparison: RepositorySourceComparison;
    plugins: PluginManifest[];
  }): Promise<string> {
    const dashboardsDir = join(this.codemeshRepoPath, ".codemesh", "dashboards");
    await mkdir(dashboardsDir, { recursive: true });
    const dashboardPath = join(dashboardsDir, "index.html");
    await writeFile(dashboardPath, renderDashboard(input), "utf8");
    return dashboardPath;
  }
}

function renderDashboard(input: {
  summary: RepositorySummary;
  repositories: RepositoryRecord[];
  duplicateRepositories: RepositoryDuplicate[];
  sourceComparison: RepositorySourceComparison;
  plugins: PluginManifest[];
}): string {
  const generatedAt = new Date().toISOString();
  const clean = input.summary.total - input.summary.dirty;
  const activePlugins = input.plugins.filter((plugin) => plugin.status === "active").length;
  const plannedPlugins = input.plugins.filter((plugin) => plugin.status === "planned").length;
  const dirtyRepos = input.repositories.filter((repo) => repo.hasChanges).slice(0, 30);
  const recentRepos = [...input.repositories]
    .filter((repo) => repo.lastCommitDate)
    .sort((a, b) => (b.lastCommitDate ?? "").localeCompare(a.lastCommitDate ?? ""))
    .slice(0, 30);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CodeMesh Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --surface: #ffffff;
      --ink: #1b1f24;
      --muted: #68707d;
      --line: #d8dde5;
      --blue: #2563eb;
      --green: #047857;
      --red: #b42318;
      --amber: #b45309;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      padding: 28px 32px 18px;
      border-bottom: 1px solid var(--line);
      background: var(--surface);
    }
    h1, h2 { margin: 0; font-weight: 680; letter-spacing: 0; }
    h1 { font-size: 28px; }
    h2 { font-size: 16px; margin-bottom: 12px; }
    .meta { color: var(--muted); margin-top: 6px; }
    main { padding: 24px 32px 36px; display: grid; gap: 24px; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }
    .metric, section {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .metric { padding: 14px 16px; }
    .metric strong { display: block; font-size: 26px; line-height: 1.1; }
    .metric span { color: var(--muted); }
    section { padding: 16px; overflow: hidden; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 8px 6px;
      text-align: left;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
      overflow-wrap: anywhere;
    }
    th { color: var(--muted); font-weight: 600; font-size: 12px; text-transform: uppercase; }
    tr:last-child td { border-bottom: 0; }
    .badge {
      display: inline-block;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
      border: 1px solid var(--line);
      color: var(--muted);
    }
    .dirty { color: var(--red); }
    .clean { color: var(--green); }
    .planned { color: var(--amber); }
    .active { color: var(--blue); }
  </style>
</head>
<body>
  <header>
    <h1>CodeMesh Dashboard</h1>
    <div class="meta">Generated ${escapeHtml(generatedAt)}. Local-first view from the CodeMesh SQLite index.</div>
  </header>
  <main>
    <div class="metrics">
      ${metric("Repositories", input.summary.total)}
      ${metric("Clean", clean)}
      ${metric("Dirty", input.summary.dirty)}
      ${metric("Overlaps", input.sourceComparison.overlapTotal)}
      ${metric("Likely matches", input.sourceComparison.likelyMatchTotal)}
      ${metric("Local only", input.sourceComparison.leftOnlyTotal)}
      ${metric("GitHub only", input.sourceComparison.rightOnlyTotal)}
      ${metric("Active plugins", activePlugins)}
      ${metric("Planned plugins", plannedPlugins)}
    </div>
    <div class="grid">
      ${countSection("Repositories by category", input.summary.byCategory)}
      ${countSection("Repositories by source", input.summary.bySource)}
      ${countSection("Repositories by language", input.summary.byLanguage)}
      ${countSection("Repositories by framework", input.summary.byFramework)}
    </div>
    ${repoSection("Dirty repositories", dirtyRepos)}
    ${sourceComparisonSection(input.sourceComparison)}
    ${duplicateSection(input.duplicateRepositories)}
    ${repoSection("Recent repositories", recentRepos)}
    ${pluginSection(input.plugins)}
  </main>
</body>
</html>
`;
}

function metric(label: string, value: number): string {
  return `<div class="metric"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`;
}

function countSection(title: string, rows: Array<{ name: string; count: number }>): string {
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <table><tbody>
      ${rows.map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${row.count}</td></tr>`).join("")}
    </tbody></table>
  </section>`;
}

function repoSection(title: string, repositories: RepositoryRecord[]): string {
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr><th>Repo</th><th>Stack</th><th>Status</th><th>Last commit</th></tr></thead>
      <tbody>
        ${repositories.map((repo) => {
          const statusClass = repo.hasChanges ? "dirty" : "clean";
          const status = repo.hasChanges ? `dirty:${repo.changedFileCount ?? 0}` : "clean";
          const stack = [repo.primaryLanguage ?? "unknown", repo.framework ?? "unknown"].join(" / ");
          return `<tr>
            <td>${escapeHtml(`${repo.category}/${repo.name}`)}</td>
            <td>${escapeHtml(stack)}</td>
            <td class="${statusClass}">${escapeHtml(status)}</td>
            <td>${escapeHtml(repo.lastCommitDate?.slice(0, 10) ?? "unknown")}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </section>`;
}

function sourceComparisonSection(comparison: RepositorySourceComparison): string {
  return `<section>
    <h2>Local and GitHub comparison</h2>
    <table>
      <thead><tr><th>Group</th><th>Count</th><th>Sample</th></tr></thead>
      <tbody>
        ${comparisonRow("Overlap", comparison.overlapTotal, comparison.overlap.flatMap((group) => group.repositories))}
        ${likelyMatchRow("Likely matches", comparison.likelyMatchTotal, comparison.likelyMatches)}
        ${comparisonRow(`Only ${comparison.leftSource}`, comparison.leftOnlyTotal, comparison.leftOnly)}
        ${comparisonRow(`Only ${comparison.rightSource}`, comparison.rightOnlyTotal, comparison.rightOnly)}
      </tbody>
    </table>
  </section>`;
}

function likelyMatchRow(
  label: string,
  count: number,
  matches: RepositorySourceComparison["likelyMatches"]
): string {
  const sample = matches
    .map((match) => escapeHtml(`${match.left.category}/${match.left.name} -> ${match.right.category}/${match.right.name}`))
    .join("<br>");

  return `<tr>
    <td>${escapeHtml(label)}</td>
    <td>${count}</td>
    <td>${sample}</td>
  </tr>`;
}

function comparisonRow(label: string, count: number, repositories: RepositoryRecord[]): string {
  return `<tr>
    <td>${escapeHtml(label)}</td>
    <td>${count}</td>
    <td>${repositories.map((repo) => escapeHtml(`${repo.category}/${repo.name}`)).join("<br>")}</td>
  </tr>`;
}

function duplicateSection(duplicateRepositories: RepositoryDuplicate[]): string {
  return `<section>
    <h2>Repository provider overlap</h2>
    <table>
      <thead><tr><th>Repo</th><th>Sources</th><th>Locations</th></tr></thead>
      <tbody>
        ${duplicateRepositories.map((group) => `<tr>
          <td>${escapeHtml(group.name)}</td>
          <td>${escapeHtml(group.sources.join(", "))}</td>
          <td>${group.repositories.map((repo) => escapeHtml(`${repo.category}/${repo.name}: ${repo.path}`)).join("<br>")}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </section>`;
}

function pluginSection(plugins: PluginManifest[]): string {
  return `<section>
    <h2>Plugin registry</h2>
    <table>
      <thead><tr><th>Plugin</th><th>Kind</th><th>Status</th><th>Capabilities</th></tr></thead>
      <tbody>
        ${plugins.map((plugin) => `<tr>
          <td>${escapeHtml(plugin.name)}</td>
          <td>${escapeHtml(plugin.kind)}</td>
          <td><span class="badge ${plugin.status}">${escapeHtml(plugin.status)}</span></td>
          <td>${escapeHtml(plugin.capabilities.join(", "))}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </section>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
