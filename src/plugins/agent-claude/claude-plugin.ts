import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { AgentPlugin, AgentProfile } from "../../core/plugins/types.js";

export class ClaudePlugin implements AgentPlugin {
  readonly name = "agent-claude";

  async detect(config: CodeMeshConfig): Promise<AgentProfile[]> {
    const instructionFilePath = join(config.obsidianVaultPath, "CLAUDE.md");
    if (!(await exists(instructionFilePath))) {
      return [];
    }

    return [{
      id: "claude-default",
      agentType: "claude",
      instructionFilePath,
      enabled: true
    }];
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
