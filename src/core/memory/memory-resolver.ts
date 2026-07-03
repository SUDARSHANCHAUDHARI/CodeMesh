import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../config/types.js";
import type { KnowledgeDocument, RepositoryRecord } from "../plugins/types.js";

export class MemoryResolver {
  async resolve(config: CodeMeshConfig, repository: RepositoryRecord, documents: KnowledgeDocument[]): Promise<KnowledgeDocument[]> {
    const candidates = await this.findMemoryCandidates(config, repository);
    const byPath = new Map<string, KnowledgeDocument>();

    for (const document of [...documents, ...candidates]) {
      byPath.set(document.path, document);
    }

    return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
  }

  private async findMemoryCandidates(config: CodeMeshConfig, repository: RepositoryRecord): Promise<KnowledgeDocument[]> {
    const codexProjectName = `${repository.category}__${repository.name}`;
    const claudeCategoryProjectName = `${repository.category}-${repository.name}`;
    const candidates = [
      {
        id: `_Codex/Memories/projects/${codexProjectName}`,
        path: join(config.obsidianVaultPath, "_Codex", "Memories", "projects", codexProjectName),
        title: `_Codex/Memories/projects/${codexProjectName}`
      },
      {
        id: `_Codex/Memories/projects/${repository.name}`,
        path: join(config.obsidianVaultPath, "_Codex", "Memories", "projects", repository.name),
        title: `_Codex/Memories/projects/${repository.name}`
      },
      {
        id: `_Claude/Memories/${claudeCategoryProjectName}`,
        path: join(config.obsidianVaultPath, "_Claude", "Memories", claudeCategoryProjectName),
        title: `_Claude/Memories/${claudeCategoryProjectName}`
      },
      {
        id: `_Claude/Memories/${repository.name}`,
        path: join(config.obsidianVaultPath, "_Claude", "Memories", repository.name),
        title: `_Claude/Memories/${repository.name}`
      }
    ];

    const documents: KnowledgeDocument[] = [];
    for (const candidate of candidates) {
      if (!(await exists(candidate.path))) {
        continue;
      }

      documents.push({
        ...candidate,
        source: "memory-resolver",
        projectHint: repository.name,
        updatedAt: new Date().toISOString()
      });
    }

    return documents;
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
