import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

export type MemoryKind = "project" | "decision" | "architecture" | "prompt" | "summary";

export interface MemoryEntry {
  filename: string;
  path: string;
  kind: MemoryKind | "unknown";
  createdAt: string;
}

export class MemoryService {
  constructor(private readonly codemeshRepoPath: string) {}

  async add(input: {
    kind: MemoryKind;
    text: string;
    repo?: string;
  }): Promise<string> {
    const memoryDir = this.memoryDir();
    await mkdir(memoryDir, { recursive: true });
    const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
    const repoPart = input.repo ? `-${safeName(input.repo)}` : "";
    const filename = `${timestamp}-${input.kind}${repoPart}.md`;
    const memoryPath = join(memoryDir, filename);
    await writeFile(memoryPath, renderMemory(input), "utf8");
    return memoryPath;
  }

  async list(): Promise<MemoryEntry[]> {
    const memoryDir = this.memoryDir();
    const filenames = await readdir(memoryDir).catch(() => []);
    const entries = await Promise.all(
      filenames
        .filter((filename) => filename.endsWith(".md"))
        .map(async (filename) => {
          const path = join(memoryDir, filename);
          const fileStat = await stat(path);
          return parseMemoryFilename(filename, path, fileStat.birthtime.toISOString());
        })
    );

    return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async show(filename: string): Promise<string> {
    const safeFilename = basename(filename);
    if (safeFilename !== filename || !safeFilename.endsWith(".md")) {
      throw new Error("Memory name must be a Markdown filename from memory list.");
    }

    return readFile(join(this.memoryDir(), safeFilename), "utf8");
  }

  private memoryDir(): string {
    return join(this.codemeshRepoPath, ".codemesh", "memory");
  }
}

function renderMemory(input: {
  kind: MemoryKind;
  text: string;
  repo?: string;
}): string {
  return `# CodeMesh Memory

- Type: ${input.kind}
- Repository: ${input.repo ?? "global"}
- Created: ${new Date().toISOString()}
- Storage: local CodeMesh memory

## Note

${input.text}
`;
}

function parseMemoryFilename(filename: string, path: string, fallbackCreatedAt: string): MemoryEntry {
  const match = filename.match(/^(.+Z)-(project|decision|architecture|prompt|summary)(?:-.+)?\.md$/);
  if (!match) {
    return {
      filename,
      path,
      kind: "unknown",
      createdAt: fallbackCreatedAt
    };
  }

  return {
    filename,
    path,
    kind: match[2] as MemoryKind,
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

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}
