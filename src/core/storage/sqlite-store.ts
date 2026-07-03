import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import type { RepositoryRecord } from "../plugins/types.js";

export interface RepositorySummary {
  total: number;
  dirty: number;
  byCategory: Array<{ name: string; count: number }>;
  bySource: Array<{ name: string; count: number }>;
  byLanguage: Array<{ name: string; count: number }>;
  byFramework: Array<{ name: string; count: number }>;
}

export interface RepositoryDuplicate {
  name: string;
  sources: string[];
  repositories: RepositoryRecord[];
}

export interface RepositoryLikelyMatch {
  left: RepositoryRecord;
  right: RepositoryRecord;
  matchKey: string;
}

export interface RepositorySourceComparison {
  leftSource: string;
  rightSource: string;
  leftTotal: number;
  rightTotal: number;
  overlapTotal: number;
  leftOnlyTotal: number;
  rightOnlyTotal: number;
  likelyMatchTotal: number;
  overlap: RepositoryDuplicate[];
  likelyMatches: RepositoryLikelyMatch[];
  leftOnly: RepositoryRecord[];
  rightOnly: RepositoryRecord[];
}

export class SqliteStore {
  constructor(private readonly dbPath: string) {}

  async init(): Promise<void> {
    await mkdir(dirname(this.dbPath), { recursive: true });
    await this.exec(`
      CREATE TABLE IF NOT EXISTS repositories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        source TEXT NOT NULL,
        primary_language TEXT,
        framework TEXT,
        package_manager TEXT,
        current_branch TEXT,
        has_changes INTEGER,
        changed_file_count INTEGER,
        last_commit_date TEXT,
        active_status TEXT NOT NULL,
        last_seen_at TEXT NOT NULL
      );
    `);
    await this.ensureColumn("repositories", "current_branch", "TEXT");
    await this.ensureColumn("repositories", "has_changes", "INTEGER");
    await this.ensureColumn("repositories", "changed_file_count", "INTEGER");
    await this.ensureColumn("repositories", "last_commit_date", "TEXT");
  }

  async saveRepositories(repositories: RepositoryRecord[]): Promise<void> {
    if (repositories.length === 0) {
      return;
    }

    const values = repositories.map((repo) => {
      return `(${[
        repo.id,
        repo.name,
        repo.path,
        repo.category,
        repo.source,
        repo.primaryLanguage ?? null,
        repo.framework ?? null,
        repo.packageManager ?? null,
        repo.currentBranch ?? null,
        repo.hasChanges === undefined ? null : String(Number(repo.hasChanges)),
        repo.changedFileCount === undefined ? null : String(repo.changedFileCount),
        repo.lastCommitDate ?? null,
        repo.activeStatus,
        repo.lastSeenAt
      ].map(toSqlValue).join(", ")})`;
    });

    await this.exec(`
      INSERT OR REPLACE INTO repositories (
        id,
        name,
        path,
        category,
        source,
        primary_language,
        framework,
        package_manager,
        current_branch,
        has_changes,
        changed_file_count,
        last_commit_date,
        active_status,
        last_seen_at
      ) VALUES ${values.join(",\n")};
    `);
  }

  async searchRepositories(query: string): Promise<RepositoryRecord[]> {
    const like = `%${query.toLowerCase()}%`;
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE lower(name) LIKE ${toSqlValue(like)}
         OR lower(category) LIKE ${toSqlValue(like)}
         OR lower(path) LIKE ${toSqlValue(like)}
         OR lower(coalesce(primary_language, '')) LIKE ${toSqlValue(like)}
         OR lower(coalesce(framework, '')) LIKE ${toSqlValue(like)}
      ORDER BY category, name
      LIMIT 50;
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listRepositories(limit = 500): Promise<RepositoryRecord[]> {
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      ORDER BY category, name
      LIMIT ${Math.max(1, Math.floor(limit))};
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listRepositoriesByCategory(category: string, limit = 250): Promise<RepositoryRecord[]> {
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE lower(category) = ${toSqlValue(category.toLowerCase())}
      ORDER BY name
      LIMIT ${toSqlLimit(limit)};
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listRepositoriesByLanguage(language: string, limit = 250): Promise<RepositoryRecord[]> {
    const normalizedLanguage = language.toLowerCase() === "unknown" ? "" : language.toLowerCase();
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE lower(coalesce(primary_language, '')) = ${toSqlValue(normalizedLanguage)}
      ORDER BY category, name
      LIMIT ${toSqlLimit(limit)};
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listRepositoriesByFramework(framework: string, limit = 250): Promise<RepositoryRecord[]> {
    const normalizedFramework = framework.toLowerCase() === "unknown" ? "" : framework.toLowerCase();
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE lower(coalesce(framework, '')) = ${toSqlValue(normalizedFramework)}
      ORDER BY category, name
      LIMIT ${toSqlLimit(limit)};
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listRepositoriesBySource(source: string, limit = 250): Promise<RepositoryRecord[]> {
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE lower(source) = ${toSqlValue(source.toLowerCase())}
      ORDER BY category, name
      LIMIT ${toSqlLimit(limit)};
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listDuplicateRepositories(limit = 50): Promise<RepositoryDuplicate[]> {
    const repositories = await this.listRepositories(5000);
    const groups = groupRepositoriesByName(repositories);

    return Array.from(groups.values())
      .map((group) => ({
        name: group[0]?.name ?? "unknown",
        sources: Array.from(new Set(group.map((repo) => repo.source))).sort(),
        repositories: group.sort(sortRepositoryRecords)
      }))
      .filter((group) => group.sources.length > 1)
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, Math.max(1, Math.floor(limit)));
  }

  async compareRepositorySources(
    leftSource = "repo-local",
    rightSource = "repo-github",
    limit = 50
  ): Promise<RepositorySourceComparison> {
    const normalizedLeftSource = leftSource.toLowerCase();
    const normalizedRightSource = rightSource.toLowerCase();
    const leftRepositories = await this.listRepositoriesBySource(normalizedLeftSource, 5000);
    const rightRepositories = await this.listRepositoriesBySource(normalizedRightSource, 5000);
    const leftByName = groupRepositoriesByName(leftRepositories);
    const rightByName = groupRepositoriesByName(rightRepositories);
    const leftNames = Array.from(leftByName.keys()).sort();
    const rightNames = Array.from(rightByName.keys()).sort();
    const overlapNames = leftNames.filter((name) => rightByName.has(name));
    const leftOnlyNames = leftNames.filter((name) => !rightByName.has(name));
    const rightOnlyNames = rightNames.filter((name) => !leftByName.has(name));
    const likelyMatches = findLikelyRepositoryMatches(leftOnlyNames, leftByName, rightOnlyNames, rightByName);
    const likelyLeftNames = new Set(likelyMatches.map((match) => normalizeRepositoryName(match.left.name)));
    const likelyRightNames = new Set(likelyMatches.map((match) => normalizeRepositoryName(match.right.name)));
    const unresolvedLeftOnlyNames = leftOnlyNames.filter((name) => !likelyLeftNames.has(name));
    const unresolvedRightOnlyNames = rightOnlyNames.filter((name) => !likelyRightNames.has(name));
    const rowLimit = Math.max(1, Math.floor(limit));

    return {
      leftSource: normalizedLeftSource,
      rightSource: normalizedRightSource,
      leftTotal: leftRepositories.length,
      rightTotal: rightRepositories.length,
      overlapTotal: overlapNames.length,
      leftOnlyTotal: unresolvedLeftOnlyNames.length,
      rightOnlyTotal: unresolvedRightOnlyNames.length,
      likelyMatchTotal: likelyMatches.length,
      overlap: overlapNames.slice(0, rowLimit).map((name) => {
        const repositories = [...(leftByName.get(name) ?? []), ...(rightByName.get(name) ?? [])]
          .sort(sortRepositoryRecords);
        return {
          name: repositories[0]?.name ?? name,
          sources: Array.from(new Set(repositories.map((repo) => repo.source))).sort(),
          repositories
        };
      }),
      likelyMatches: likelyMatches.slice(0, rowLimit),
      leftOnly: unresolvedLeftOnlyNames.slice(0, rowLimit).flatMap((name) => leftByName.get(name) ?? []).sort(sortRepositoryRecords),
      rightOnly: unresolvedRightOnlyNames.slice(0, rowLimit).flatMap((name) => rightByName.get(name) ?? []).sort(sortRepositoryRecords)
    };
  }

  async listDirtyRepositories(): Promise<RepositoryRecord[]> {
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE has_changes = 1
      ORDER BY changed_file_count DESC, category, name
      LIMIT 100;
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async listStaleRepositories(thresholdIsoDate: string): Promise<RepositoryRecord[]> {
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE last_commit_date IS NOT NULL
        AND last_commit_date != ''
        AND last_commit_date < ${toSqlValue(thresholdIsoDate)}
      ORDER BY last_commit_date ASC, category, name
      LIMIT 100;
    `);

    return rows.map(rowToRepositoryRecord);
  }

  async repositorySummary(): Promise<RepositorySummary> {
    const totalRows = await this.query("SELECT COUNT(*) FROM repositories;");
    const dirtyRows = await this.query("SELECT COUNT(*) FROM repositories WHERE has_changes = 1;");

    return {
      total: Number(totalRows[0]?.[0] ?? 0),
      dirty: Number(dirtyRows[0]?.[0] ?? 0),
      byCategory: await this.countBy("category"),
      bySource: await this.countBy("source"),
      byLanguage: await this.countBy("primary_language"),
      byFramework: await this.countBy("framework")
    };
  }

  async exec(sql: string): Promise<void> {
    await runSqlite(this.dbPath, sql);
  }

  private async query(sql: string): Promise<string[][]> {
    const output = await runSqlite(this.dbPath, `.mode tabs\n${sql}`);
    return output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("\t"));
  }

  private async ensureColumn(tableName: string, columnName: string, columnType: string): Promise<void> {
    const columns = await this.query(`PRAGMA table_info(${tableName});`);
    const hasColumn = columns.some((column) => column[1] === columnName);
    if (!hasColumn) {
      await this.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType};`);
    }
  }

  private async countBy(columnName: "category" | "source" | "primary_language" | "framework"): Promise<Array<{ name: string; count: number }>> {
    const rows = await this.query(`
      SELECT coalesce(nullif(${columnName}, ''), 'unknown') AS name, COUNT(*) AS count
      FROM repositories
      GROUP BY 1
      ORDER BY count DESC, name
      LIMIT 25;
    `);

    return rows.map((row) => ({
      name: row[0] ?? "unknown",
      count: Number(row[1] ?? 0)
    }));
  }
}

function rowToRepositoryRecord(row: string[]): RepositoryRecord {
  return {
    id: row[0] ?? "",
    name: row[1] ?? "",
    path: row[2] ?? "",
    category: row[3] ?? "",
    source: row[4] ?? "",
    primaryLanguage: row[5] || undefined,
    framework: row[6] || undefined,
    packageManager: row[7] || undefined,
    currentBranch: row[8] || undefined,
    hasChanges: row[9] === "" ? undefined : row[9] === "1",
    changedFileCount: row[10] === "" ? undefined : Number(row[10]),
    lastCommitDate: row[11] || undefined,
    activeStatus: (row[12] as RepositoryRecord["activeStatus"]) || "unknown",
    lastSeenAt: row[13] ?? ""
  };
}

function groupRepositoriesByName(repositories: RepositoryRecord[]): Map<string, RepositoryRecord[]> {
  const groups = new Map<string, RepositoryRecord[]>();
  for (const repository of repositories) {
    const normalizedName = normalizeRepositoryName(repository.name);
    if (!normalizedName) {
      continue;
    }

    groups.set(normalizedName, [...(groups.get(normalizedName) ?? []), repository]);
  }

  return groups;
}

function findLikelyRepositoryMatches(
  leftOnlyNames: string[],
  leftByName: Map<string, RepositoryRecord[]>,
  rightOnlyNames: string[],
  rightByName: Map<string, RepositoryRecord[]>
): RepositoryLikelyMatch[] {
  const rightByLikelyKey = new Map<string, RepositoryRecord[]>();
  for (const name of rightOnlyNames) {
    const key = likelyRepositoryKey(name);
    if (!key) {
      continue;
    }

    rightByLikelyKey.set(key, [
      ...(rightByLikelyKey.get(key) ?? []),
      ...(rightByName.get(name) ?? [])
    ]);
  }

  const matches: RepositoryLikelyMatch[] = [];
  const seenPairs = new Set<string>();
  for (const name of leftOnlyNames) {
    const matchKey = likelyRepositoryKey(name);
    const leftRepositories = leftByName.get(name) ?? [];
    const rightRepositories = rightByLikelyKey.get(matchKey) ?? [];
    for (const left of leftRepositories) {
      for (const right of rightRepositories) {
        const pairKey = `${left.id}\t${right.id}`;
        if (seenPairs.has(pairKey)) {
          continue;
        }

        seenPairs.add(pairKey);
        matches.push({ left, right, matchKey });
      }
    }
  }

  return matches.sort((left, right) => {
    return left.left.name.localeCompare(right.left.name) || left.right.name.localeCompare(right.right.name);
  });
}

function likelyRepositoryKey(name: string): string {
  return normalizeRepositoryName(name)
    .replace(/(?:^|[-_\s.])(main|master|repo|repository|app)$/u, "")
    .replace(/[^a-z0-9]/gu, "");
}

function normalizeRepositoryName(name: string): string {
  return name.trim().toLowerCase();
}

function sortRepositoryRecords(left: RepositoryRecord, right: RepositoryRecord): number {
  return (
    left.source.localeCompare(right.source)
    || left.category.localeCompare(right.category)
    || left.path.localeCompare(right.path)
  );
}

function toSqlValue(value: string | null): string {
  if (value === null) {
    return "NULL";
  }

  return `'${value.replaceAll("'", "''")}'`;
}

function toSqlLimit(value: number): string {
  return String(Math.max(1, Math.floor(value)));
}

function runSqlite(dbPath: string, sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("sqlite3", [dbPath], {
      stdio: ["pipe", "pipe", "pipe"]
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
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `sqlite3 exited with code ${code}`));
      }
    });

    child.stdin.end(sql);
  });
}
