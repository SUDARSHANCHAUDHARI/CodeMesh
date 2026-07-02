import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import type { RepositoryRecord } from "../plugins/types.js";

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
        active_status TEXT NOT NULL,
        last_seen_at TEXT NOT NULL
      );
    `);
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
        active_status,
        last_seen_at
      ) VALUES ${values.join(",\n")};
    `);
  }

  async searchRepositories(query: string): Promise<RepositoryRecord[]> {
    const like = `%${query.toLowerCase()}%`;
    const rows = await this.query(`
      SELECT id, name, path, category, source, primary_language, framework, package_manager, active_status, last_seen_at
      FROM repositories
      WHERE lower(name) LIKE ${toSqlValue(like)}
         OR lower(category) LIKE ${toSqlValue(like)}
         OR lower(path) LIKE ${toSqlValue(like)}
      ORDER BY category, name
      LIMIT 50;
    `);

    return rows.map((row) => ({
      id: row[0] ?? "",
      name: row[1] ?? "",
      path: row[2] ?? "",
      category: row[3] ?? "",
      source: row[4] ?? "",
      primaryLanguage: row[5] || undefined,
      framework: row[6] || undefined,
      packageManager: row[7] || undefined,
      activeStatus: (row[8] as RepositoryRecord["activeStatus"]) || "unknown",
      lastSeenAt: row[9] ?? ""
    }));
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
