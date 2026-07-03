import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { KnowledgeDocument, KnowledgeSourcePlugin } from "../../core/plugins/types.js";

const ROOT_MARKDOWN_FILES = ["README.md", "AGENTS.md", "CLAUDE.md", "CODEX.md", "GEMINI.md", "AIDER.md", "OPENCODE.md", "AMP.md"];

export class MarkdownKnowledgePlugin implements KnowledgeSourcePlugin {
  readonly name = "knowledge-markdown";

  async detect(config: CodeMeshConfig): Promise<KnowledgeDocument[]> {
    const documents: KnowledgeDocument[] = [];
    const categories = await readdir(config.repoCategoriesRoot, { withFileTypes: true }).catch(() => []);

    for (const category of categories) {
      if (!category.isDirectory() || config.ignoredCategoryNames.includes(category.name)) {
        continue;
      }

      const categoryPath = join(config.repoCategoriesRoot, category.name);
      if (await exists(join(categoryPath, ".git"))) {
        documents.push(...await detectRepoDocs(categoryPath, "Root", category.name, this.name));
      }

      const children = await readdir(categoryPath, { withFileTypes: true }).catch(() => []);
      for (const child of children) {
        if (!child.isDirectory()) {
          continue;
        }

        const repoPath = join(categoryPath, child.name);
        if (!(await exists(join(repoPath, ".git")))) {
          continue;
        }

        documents.push(...await detectRepoDocs(repoPath, category.name, child.name, this.name));
      }
    }

    return documents;
  }
}

async function detectRepoDocs(repoPath: string, category: string, repoName: string, source: string): Promise<KnowledgeDocument[]> {
  const documents: KnowledgeDocument[] = [];
  for (const filename of ROOT_MARKDOWN_FILES) {
    const path = join(repoPath, filename);
    if (await exists(path)) {
      documents.push(documentFor(source, category, repoName, path, filename));
    }
  }

  const docsPath = join(repoPath, "docs");
  const docsChildren = await readdir(docsPath, { withFileTypes: true }).catch(() => []);
  for (const child of docsChildren) {
    if (!child.isFile() || !child.name.endsWith(".md")) {
      continue;
    }

    const path = join(docsPath, child.name);
    documents.push(documentFor(source, category, repoName, path, `docs/${child.name}`));
  }

  return documents;
}

function documentFor(source: string, category: string, repoName: string, path: string, title: string): KnowledgeDocument {
  return {
    id: `${category}/${repoName}/${title}`,
    source,
    path,
    title: `${repoName}/${title}`,
    projectHint: repoName,
    updatedAt: new Date().toISOString()
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
