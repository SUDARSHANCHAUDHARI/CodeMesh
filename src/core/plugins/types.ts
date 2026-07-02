import type { CodeMeshConfig } from "../config/types.js";

export interface RepositoryRecord {
  id: string;
  name: string;
  path: string;
  category: string;
  source: string;
  primaryLanguage?: string;
  framework?: string;
  packageManager?: string;
  currentBranch?: string;
  hasChanges?: boolean;
  changedFileCount?: number;
  lastCommitDate?: string;
  activeStatus: "active" | "archived" | "unknown";
  lastSeenAt: string;
}

export interface KnowledgeDocument {
  id: string;
  source: string;
  path: string;
  title: string;
  projectHint?: string;
  updatedAt?: string;
}

export interface AgentProfile {
  id: string;
  agentType: "claude" | "codex" | string;
  instructionFilePath: string;
  enabled: boolean;
}

export interface ContextCapsuleInput {
  repository: RepositoryRecord;
  task: string;
  knowledgeDocuments: KnowledgeDocument[];
  agentProfiles: AgentProfile[];
}

export interface RepositorySourcePlugin {
  name: string;
  discover(config: CodeMeshConfig): Promise<RepositoryRecord[]>;
}

export interface KnowledgeSourcePlugin {
  name: string;
  detect(config: CodeMeshConfig): Promise<KnowledgeDocument[]>;
}

export interface AgentPlugin {
  name: string;
  detect(config: CodeMeshConfig): Promise<AgentProfile[]>;
}

export interface CapsuleRendererPlugin {
  name: string;
  render(input: ContextCapsuleInput): string;
}
