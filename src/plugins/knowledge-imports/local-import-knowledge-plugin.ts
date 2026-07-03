import { readdir, stat } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { KnowledgeDocument, KnowledgeSourcePlugin } from "../../core/plugins/types.js";

const IMPORT_EXTENSIONS = new Set([".md", ".markdown", ".json", ".txt"]);

export class LocalImportKnowledgePlugin implements KnowledgeSourcePlugin {
  readonly name = "knowledge-imports";

  async detect(config: CodeMeshConfig): Promise<KnowledgeDocument[]> {
    const roots = [
      { source: "knowledge-notion", path: config.notionImportPath },
      { source: "knowledge-notebooklm", path: config.notebookLmImportPath },
      { source: "knowledge-github-wiki", path: config.githubWikiImportPath }
    ];
    const documents: KnowledgeDocument[] = [];

    for (const root of roots) {
      if (!root.path || !(await exists(root.path))) {
        continue;
      }

      const files = await walkImportFiles(root.path);
      documents.push(...files.map((file) => ({
        id: `${root.source}/${relative(root.path ?? "", file)}`,
        source: root.source,
        path: file,
        title: basename(file),
        projectHint: projectHintFromPath(file),
        updatedAt: new Date().toISOString()
      })));
    }

    return documents;
  }
}

async function walkImportFiles(rootPath: string): Promise<string[]> {
  const children = await readdir(rootPath, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];

  for (const child of children) {
    const childPath = join(rootPath, child.name);
    if (child.isDirectory()) {
      files.push(...await walkImportFiles(childPath));
      continue;
    }

    if (child.isFile() && IMPORT_EXTENSIONS.has(extensionOf(child.name))) {
      files.push(childPath);
    }
  }

  return files;
}

function extensionOf(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index === -1 ? "" : filename.slice(index).toLowerCase();
}

function projectHintFromPath(path: string): string | undefined {
  const name = basename(path).replace(/\.(md|markdown|json|txt)$/iu, "");
  return name || undefined;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
