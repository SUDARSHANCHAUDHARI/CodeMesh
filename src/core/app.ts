import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { ConfigManager } from "./config/config-manager.js";
import { SqliteStore } from "./storage/sqlite-store.js";
import { RepoLocalPlugin } from "../plugins/repo-local/repo-local-plugin.js";
import { ObsidianPlugin } from "../plugins/knowledge-obsidian/obsidian-plugin.js";
import { MarkdownKnowledgePlugin } from "../plugins/knowledge-markdown/markdown-knowledge-plugin.js";
import { ClaudePlugin } from "../plugins/agent-claude/claude-plugin.js";
import { CodexPlugin } from "../plugins/agent-codex/codex-plugin.js";
import { LocalAgentPlugin } from "../plugins/agent-local/agent-local-plugin.js";
import { MarkdownCapsuleRenderer } from "../plugins/capsule-markdown/markdown-capsule-renderer.js";
import { CapsuleService } from "./capsules/capsule-service.js";
import { DashboardService } from "./dashboard/dashboard-service.js";
import { MemoryResolver } from "./memory/memory-resolver.js";
import { PluginRegistry } from "./plugins/plugin-registry.js";
import { ReportService, type ReportKind } from "./reports/report-service.js";
import type { CapsuleTemplate } from "./plugins/types.js";

export class CodeMeshApp {
  private readonly configManager = new ConfigManager();
  private readonly repoPlugin = new RepoLocalPlugin();
  private readonly knowledgePlugin = new ObsidianPlugin();
  private readonly knowledgePlugins = [this.knowledgePlugin, new MarkdownKnowledgePlugin()];
  private readonly memoryResolver = new MemoryResolver();
  private readonly pluginRegistry = new PluginRegistry();
  private readonly agentPlugins = [new ClaudePlugin(), new CodexPlugin(), new LocalAgentPlugin()];

  async init(): Promise<string> {
    return this.configManager.init();
  }

  listPlugins() {
    return this.pluginRegistry.list();
  }

  async scanRepos(): Promise<number> {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    const repositories = await this.repoPlugin.discover(config);
    await store.saveRepositories(repositories);
    return repositories.length;
  }

  async scanVault(): Promise<number> {
    const config = await this.configManager.load();
    const documents = await this.knowledgePlugin.detect(config);
    return documents.length;
  }

  async scanKnowledge(): Promise<number> {
    const config = await this.configManager.load();
    const documents = (await Promise.all(this.knowledgePlugins.map((plugin) => plugin.detect(config)))).flat();
    return documents.length;
  }

  async searchRepos(query: string) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.searchRepositories(query);
  }

  async categoryRepos(category: string) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.listRepositoriesByCategory(category);
  }

  async languageRepos(language: string) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.listRepositoriesByLanguage(language);
  }

  async frameworkRepos(framework: string) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.listRepositoriesByFramework(framework);
  }

  async showRepo(query: string) {
    const repositories = await this.searchRepos(query);
    const repository = repositories[0];
    if (!repository) {
      throw new Error(`No repository matched query: ${query}`);
    }

    return repository;
  }

  async dirtyRepos() {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.listDirtyRepositories();
  }

  async staleRepos(days: number) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    return store.listStaleRepositories(threshold);
  }

  async repoSummary() {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.repositorySummary();
  }

  async generateDashboard(): Promise<string> {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    const dashboardService = new DashboardService(config.codemeshRepoPath);
    return dashboardService.generate({
      summary: await store.repositorySummary(),
      repositories: await store.listRepositories(),
      plugins: this.pluginRegistry.list()
    });
  }

  async generateReport(kind: ReportKind): Promise<string> {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    const staleDays = kind === "daily" ? 30 : 90;
    const staleThreshold = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000).toISOString();
    const reportService = new ReportService(config.codemeshRepoPath);
    return reportService.generate({
      kind,
      summary: await store.repositorySummary(),
      dirtyRepositories: await store.listDirtyRepositories(),
      staleRepositories: await store.listStaleRepositories(staleThreshold),
      plugins: this.pluginRegistry.list()
    });
  }

  async createCapsule(repoQuery: string, task: string, template: CapsuleTemplate = "neutral"): Promise<string> {
    const config = await this.configManager.load();
    const capsuleInput = await this.buildCapsuleInput(repoQuery, task, template);
    const capsuleService = new CapsuleService(config.codemeshRepoPath, new MarkdownCapsuleRenderer());

    return capsuleService.create(capsuleInput);
  }

  async previewCapsule(repoQuery: string, task: string, template: CapsuleTemplate = "neutral"): Promise<string> {
    const config = await this.configManager.load();
    const capsuleInput = await this.buildCapsuleInput(repoQuery, task, template);
    const capsuleService = new CapsuleService(config.codemeshRepoPath, new MarkdownCapsuleRenderer());

    return capsuleService.preview(capsuleInput);
  }

  async listCapsules() {
    const config = await this.configManager.load();
    const capsuleService = new CapsuleService(config.codemeshRepoPath, new MarkdownCapsuleRenderer());
    return capsuleService.list();
  }

  async showCapsule(filename: string): Promise<string> {
    const config = await this.configManager.load();
    const capsuleService = new CapsuleService(config.codemeshRepoPath, new MarkdownCapsuleRenderer());
    return capsuleService.show(filename);
  }

  private async buildCapsuleInput(repoQuery: string, task: string, template: CapsuleTemplate) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();

    let repositories = await store.searchRepositories(repoQuery);
    if (repositories.length === 0) {
      await this.scanRepos();
      repositories = await store.searchRepositories(repoQuery);
    }

    const repository = repositories[0];
    if (!repository) {
      throw new Error(`No repository matched query: ${repoQuery}`);
    }

    const knowledgeDocuments = await this.memoryResolver.resolve(
      config,
      repository,
      (await Promise.all(this.knowledgePlugins.map((plugin) => plugin.detect(config)))).flat()
    );
    const agentProfiles = (await Promise.all(this.agentPlugins.map((plugin) => plugin.detect(config)))).flat();

    return {
      repository,
      task,
      template,
      knowledgeDocuments: knowledgeDocuments.filter((doc) => {
        return doc.projectHint === repository.name || doc.projectHint === repository.category;
      }),
      agentProfiles
    };
  }

  async doctor(): Promise<string[]> {
    const config = await this.configManager.load();
    const codemeshDataPath = join(config.codemeshRepoPath, ".codemesh");
    const indexPath = join(codemeshDataPath, "index.sqlite");
    const capsulesPath = join(codemeshDataPath, "capsules");
    const sqliteAvailable = await commandAvailable("sqlite3", ["--version"]);
    const checks = await Promise.all([
      pathCheck("Repo categories root", config.repoCategoriesRoot),
      pathCheck("Obsidian vault (read-only)", config.obsidianVaultPath),
      pathCheck("CodeMesh repo", config.codemeshRepoPath),
      pathCheck("CodeMesh data directory", codemeshDataPath),
      pathCheck("SQLite index", indexPath),
      pathCheck("Capsule output directory", capsulesPath)
    ]);

    return [
      ...checks,
      `${sqliteAvailable ? "PASS" : "FAIL"} sqlite3 command: ${sqliteAvailable ? "available" : "missing"}`,
      "PASS Obsidian write policy: read-only"
    ];
  }
}

async function pathCheck(label: string, path: string): Promise<string> {
  try {
    await access(path, constants.F_OK);
    return `PASS ${label}: ${path}`;
  } catch {
    return `WARN ${label}: missing at ${path}`;
  }
}

function commandAvailable(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "ignore", "ignore"]
    });

    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
