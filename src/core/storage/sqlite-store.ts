import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import type { RepositoryRecord } from "../plugins/types.js";

export interface RepositorySummary {
  total: number;
  dirty: number;
  byCategory: Array<{ name: string; count: number }>;
  byLanguage: Array<{ name: string; count: number }>;
  byFramework: Array<{ name: string; count: number }>;
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

  async listRepositoriesByCategory(category: string): Promise<RepositoryRecord[]> {
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, current_branch, has_changes, changed_file_count, last_commit_date, active_status, last_seen_at
      FROM repositories
      WHERE lower(category) = ${toSqlValue(category.toLowerCase())}
      ORDER BY name
      LIMIT 250;
    `);

    return rows.map(rowToRepositoryRecord);
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

  private async countBy(columnName: "category" | "primary_language" | "framework"): Promise<Array<{ name: string; count: number }>> {
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

function toSqlValue(value: string | null): string {
  if (value === null) {
    return "NULL";
  }

  return `'${value.replaceAll("'", "''")}'`;
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
