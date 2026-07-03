import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { AgentProfile, CapsuleRendererPlugin, CapsuleTemplate, KnowledgeDocument, RepositoryRecord } from "../plugins/types.js";

export interface CapsuleHistoryEntry {
  filename: string;
  path: string;
  repositoryName: string;
  createdAt: string;
}

export class CapsuleService {
  constructor(
    private readonly codemeshRepoPath: string,
    private readonly renderer: CapsuleRendererPlugin
  ) {}

  async create(input: {
    repository: RepositoryRecord;
    task: string;
    template: CapsuleTemplate;
    knowledgeDocuments: KnowledgeDocument[];
    agentProfiles: AgentProfile[];
  }): Promise<string> {
    const capsulesDir = join(this.codemeshRepoPath, ".codemesh", "capsules");
    await mkdir(capsulesDir, { recursive: true });

    const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
    const safeRepoName = input.repository.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const capsulePath = join(capsulesDir, `${timestamp}-${safeRepoName}.md`);
    await writeFile(capsulePath, this.renderer.render(input), "utf8");
    return capsulePath;
  }

  preview(input: {
    repository: RepositoryRecord;
    task: string;
    template: CapsuleTemplate;
    knowledgeDocuments: KnowledgeDocument[];
    agentProfiles: AgentProfile[];
  }): string {
    return this.renderer.render(input);
  }

  async list(): Promise<CapsuleHistoryEntry[]> {
    const capsulesDir = this.capsulesDir();
    const filenames = await readdir(capsulesDir).catch(() => []);
    const entries = await Promise.all(
      filenames
        .filter((filename) => filename.endsWith(".md"))
        .map(async (filename) => {
          const path = join(capsulesDir, filename);
          const fileStat = await stat(path);
          return parseCapsuleFilename(filename, path, fileStat.birthtime.toISOString());
        })
    );

    return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async show(filename: string): Promise<string> {
    const safeFilename = basename(filename);
    if (safeFilename !== filename || !safeFilename.endsWith(".md")) {
      throw new Error("Capsule name must be a Markdown filename from capsule list.");
    }

    return readFile(join(this.capsulesDir(), safeFilename), "utf8");
  }

  private capsulesDir(): string {
    return join(this.codemeshRepoPath, ".codemesh", "capsules");
  }
}

function parseCapsuleFilename(filename: string, path: string, fallbackCreatedAt: string): CapsuleHistoryEntry {
  const match = filename.match(/^(.+Z)-(.+)\.md$/);
  if (!match) {
    return {
      filename,
      path,
      repositoryName: "unknown",
      createdAt: fallbackCreatedAt
    };
  }

  return {
    filename,
    path,
    repositoryName: match[2] ?? "unknown",
    createdAt: timestampFromFilename(match[1] ?? "") ?? fallbackCreatedAt
  };
}

function timestampFromFilename(value: string): string | undefined {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/);
  if (!match) {
    return undefined;
  }

  return `${match[1]}T${match[2]}:${match[3]}:${match[4]}.${match[5]}Z`;
}
