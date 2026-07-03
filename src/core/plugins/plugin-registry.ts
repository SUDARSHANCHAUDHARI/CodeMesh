import type { PluginManifest } from "./types.js";

export class PluginRegistry {
  list(): PluginManifest[] {
    return PLUGINS;
  }
}

const PLUGINS: PluginManifest[] = [
  {
    name: "repo-local",
    kind: "repository-source",
    status: "active",
    description: "Discovers local Git repositories under category folders and top-level repo roots.",
    capabilities: ["local-git", "category-discovery", "git-metadata"]
  },
  {
    name: "knowledge-obsidian",
    kind: "knowledge-source",
    status: "active",
    description: "Detects existing Obsidian knowledge structure without writing to the vault.",
    capabilities: ["read-only", "markdown", "project-memory"]
  },
  {
    name: "knowledge-markdown",
    kind: "knowledge-source",
    status: "active",
    description: "Detects local repository Markdown documentation and agent instruction files.",
    capabilities: ["markdown", "local-documentation", "read-only"]
  },
  {
    name: "agent-claude",
    kind: "agent",
    status: "active",
    description: "Detects Claude instruction files.",
    capabilities: ["CLAUDE.md", "handoff-context"]
  },
  {
    name: "agent-codex",
    kind: "agent",
    status: "active",
    description: "Detects Codex instruction files.",
    capabilities: ["AGENTS.md", "CODEX.md", "handoff-context"]
  },
  {
    name: "capsule-markdown",
    kind: "capsule-renderer",
    status: "active",
    description: "Renders portable Markdown context capsules.",
    capabilities: ["markdown", "codex-template", "claude-template", "neutral-template"]
  },
  {
    name: "repo-github",
    kind: "repository-source",
    status: "active",
    description: "Read-only GitHub repository metadata provider.",
    capabilities: ["github", "gh-cli", "remote-metadata", "private-repos"]
  },
  {
    name: "repo-gitlab",
    kind: "repository-source",
    status: "active",
    description: "Optional read-only GitLab repository metadata provider.",
    capabilities: ["gitlab", "remote-metadata", "optional-token"]
  },
  {
    name: "repo-bitbucket",
    kind: "repository-source",
    status: "active",
    description: "Optional read-only Bitbucket repository metadata provider.",
    capabilities: ["bitbucket", "remote-metadata", "optional-token"]
  },
  {
    name: "knowledge-notion",
    kind: "knowledge-source",
    status: "planned",
    description: "Notion knowledge provider.",
    capabilities: ["notion", "documents"]
  },
  {
    name: "knowledge-notebooklm",
    kind: "knowledge-source",
    status: "planned",
    description: "NotebookLM knowledge provider.",
    capabilities: ["notebooklm", "documents"]
  },
  {
    name: "agent-local",
    kind: "agent",
    status: "active",
    description: "Detects local instruction files for Gemini CLI, OpenCode, Aider, Amp, Cursor, and Windsurf.",
    capabilities: ["gemini-cli", "opencode", "aider", "amp", "cursor", "windsurf", "handoff-context"]
  },
  {
    name: "agent-gemini-cli",
    kind: "agent",
    status: "planned",
    description: "Dedicated Gemini CLI provider with richer project context.",
    capabilities: ["gemini-cli", "handoff-context"]
  },
  {
    name: "agent-opencode",
    kind: "agent",
    status: "planned",
    description: "Dedicated OpenCode provider with richer project context.",
    capabilities: ["opencode", "handoff-context"]
  },
  {
    name: "agent-aider",
    kind: "agent",
    status: "planned",
    description: "Dedicated Aider provider with richer project context.",
    capabilities: ["aider", "handoff-context"]
  },
  {
    name: "agent-amp",
    kind: "agent",
    status: "planned",
    description: "Dedicated Amp provider with richer project context.",
    capabilities: ["amp", "handoff-context"]
  },
  {
    name: "agent-cursor",
    kind: "agent",
    status: "planned",
    description: "Dedicated Cursor provider with richer project context.",
    capabilities: ["cursor", "rules", "handoff-context"]
  },
  {
    name: "agent-windsurf",
    kind: "agent",
    status: "planned",
    description: "Dedicated Windsurf provider with richer project context.",
    capabilities: ["windsurf", "rules", "handoff-context"]
  },
  {
    name: "dashboard-local",
    kind: "dashboard",
    status: "planned",
    description: "Local static dashboard for repository and activity health.",
    capabilities: ["local-html", "repository-health", "project-health"]
  },
  {
    name: "automation-reports",
    kind: "automation",
    status: "planned",
    description: "Local daily summaries, weekly reports, release notes, changelogs, and PR summaries.",
    capabilities: ["markdown-reports", "local-first", "no-cloud-required"]
  }
];
