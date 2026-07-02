import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { AgentPlugin, AgentProfile } from "../../core/plugins/types.js";

export class CodexPlugin implements AgentPlugin {
  readonly name = "agent-codex";

  async detect(config: CodeMeshConfig): Promise<AgentProfile[]> {
    const paths = [
      join(config.obsidianVaultPath, "CODEX.md"),
      join(config.obsidianVaultPath, "AGENTS.md")
    ];

    const profiles: AgentProfile[] = [];
    for (const instructionFilePath of paths) {
      if (await exists(instructionFilePath)) {
        profiles.push({
          id: instructionFilePath.endsWith("AGENTS.md") ? "agents-shared" : "codex-default",
          agentType: "codex",
          instructionFilePath,
          enabled: true
        });
      }
    }

    return profiles;
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
