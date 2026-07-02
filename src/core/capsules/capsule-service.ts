import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AgentProfile, CapsuleRendererPlugin, KnowledgeDocument, RepositoryRecord } from "../plugins/types.js";

export class CapsuleService {
  constructor(
    private readonly codemeshRepoPath: string,
    private readonly renderer: CapsuleRendererPlugin
  ) {}

  async create(input: {
    repository: RepositoryRecord;
    task: string;
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
}
