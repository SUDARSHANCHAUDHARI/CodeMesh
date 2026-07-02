import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { KnowledgeDocument, KnowledgeSourcePlugin } from "../../core/plugins/types.js";

const READABLE_ZONES = ["_Projects", "_RepoMem", "_Claude", "_Codex"];

export class ObsidianPlugin implements KnowledgeSourcePlugin {
  readonly name = "knowledge-obsidian";

  async detect(config: CodeMeshConfig): Promise<KnowledgeDocument[]> {
    const documents: KnowledgeDocument[] = [];

    for (const zone of READABLE_ZONES) {
      const zonePath = join(config.obsidianVaultPath, zone);
      if (!(await exists(zonePath))) {
        continue;
      }

      documents.push({
        id: zone,
        source: this.name,
        path: zonePath,
        title: zone,
        updatedAt: new Date().toISOString()
      });

      const children = await readdir(zonePath, { withFileTypes: true }).catch(() => []);
      for (const child of children) {
        if (!child.isDirectory()) {
          continue;
        }

        documents.push({
          id: `${zone}/${child.name}`,
          source: this.name,
          path: join(zonePath, child.name),
          title: child.name,
          projectHint: child.name,
          updatedAt: new Date().toISOString()
        });

        if (zone !== "_Projects" && zone !== "_RepoMem") {
          continue;
        }

        const projectPath = join(zonePath, child.name);
        const projects = await readdir(projectPath, { withFileTypes: true }).catch(() => []);
        for (const project of projects) {
          if (!project.isDirectory()) {
            continue;
          }

          documents.push({
            id: `${zone}/${child.name}/${project.name}`,
            source: this.name,
            path: join(projectPath, project.name),
            title: `${child.name}/${project.name}`,
            projectHint: project.name,
            updatedAt: new Date().toISOString()
          });
        }
      }
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
