import { join } from "node:path";
import { ConfigManager } from "./config/config-manager.js";
import { SqliteStore } from "./storage/sqlite-store.js";
import { RepoLocalPlugin } from "../plugins/repo-local/repo-local-plugin.js";
import { ObsidianPlugin } from "../plugins/knowledge-obsidian/obsidian-plugin.js";
import { ClaudePlugin } from "../plugins/agent-claude/claude-plugin.js";
import { CodexPlugin } from "../plugins/agent-codex/codex-plugin.js";
import { MarkdownCapsuleRenderer } from "../plugins/capsule-markdown/markdown-capsule-renderer.js";
import { CapsuleService } from "./capsules/capsule-service.js";
import type { CapsuleTemplate } from "./plugins/types.js";

export class CodeMeshApp {
  private readonly configManager = new ConfigManager();
  private readonly repoPlugin = new RepoLocalPlugin();
  private readonly knowledgePlugin = new ObsidianPlugin();
  private readonly agentPlugins = [new ClaudePlugin(), new CodexPlugin()];

  async init(): Promise<string> {
    return this.configManager.init();
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

  async searchRepos(query: string) {
    const config = await this.configManager.load();
    const store = new SqliteStore(join(config.codemeshRepoPath, ".codemesh", "index.sqlite"));
    await store.init();
    return store.searchRepositories(query);
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

    const knowledgeDocuments = await this.knowledgePlugin.detect(config);
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
    const checks = [
      ["Repo categories root", config.repoCategoriesRoot],
      ["Obsidian vault", config.obsidianVaultPath],
      ["CodeMesh repo", config.codemeshRepoPath]
    ];

    return checks.map(([label, value]) => `${label}: ${value}`);
  }
}
