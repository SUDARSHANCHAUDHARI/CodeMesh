import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { CodeMeshConfig } from "../../core/config/types.js";
import type { AgentPlugin, AgentProfile } from "../../core/plugins/types.js";

interface AgentInstructionCandidate {
  agentType: string;
  relativePath: string;
}

const CANDIDATES: AgentInstructionCandidate[] = [
  { agentType: "gemini-cli", relativePath: "GEMINI.md" },
  { agentType: "opencode", relativePath: "opencode.json" },
  { agentType: "opencode", relativePath: "OPENCODE.md" },
  { agentType: "aider", relativePath: ".aider.conf.yml" },
  { agentType: "aider", relativePath: "AIDER.md" },
  { agentType: "amp", relativePath: "AMP.md" },
  { agentType: "cursor", relativePath: ".cursorrules" },
  { agentType: "cursor", relativePath: ".cursor/rules" },
  { agentType: "windsurf", relativePath: ".windsurfrules" },
  { agentType: "windsurf", relativePath: ".windsurf/rules" }
];

export class LocalAgentPlugin implements AgentPlugin {
  readonly name = "agent-local";

  async detect(config: CodeMeshConfig): Promise<AgentProfile[]> {
    const profiles = await Promise.all(
      CANDIDATES.map(async (candidate): Promise<AgentProfile | undefined> => {
        const instructionFilePath = join(config.obsidianVaultPath, candidate.relativePath);
        if (!(await exists(instructionFilePath))) {
          return undefined;
        }

        return {
          id: `${candidate.agentType}:${instructionFilePath}`,
          agentType: candidate.agentType,
          instructionFilePath,
          enabled: true
        } satisfies AgentProfile;
      })
    );

    return profiles.filter((profile): profile is AgentProfile => Boolean(profile));
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
