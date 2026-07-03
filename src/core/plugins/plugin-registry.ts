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
    status: "planned",
    description: "Read-only GitHub repository metadata provider.",
    capabilities: ["github", "remote-metadata", "private-repos"]
  },
  {
    name: "repo-gitlab",
    kind: "repository-source",
    status: "planned",
    description: "Read-only GitLab repository metadata provider.",
    capabilities: ["gitlab", "remote-metadata"]
  },
  {
    name: "repo-bitbucket",
    kind: "repository-source",
    status: "planned",
    description: "Read-only Bitbucket repository metadata provider.",
    capabilities: ["bitbucket", "remote-metadata"]
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
    name: "agent-gemini-cli",
    kind: "agent",
    status: "planned",
    description: "Gemini CLI instruction and context provider.",
    capabilities: ["gemini-cli", "handoff-context"]
  },
  {
    name: "agent-opencode",
    kind: "agent",
    status: "planned",
    description: "OpenCode instruction and context provider.",
    capabilities: ["opencode", "handoff-context"]
  },
  {
    name: "agent-aider",
    kind: "agent",
    status: "planned",
    description: "Aider instruction and context provider.",
    capabilities: ["aider", "handoff-context"]
  },
  {
    name: "agent-amp",
    kind: "agent",
    status: "planned",
    description: "Amp instruction and context provider.",
    capabilities: ["amp", "handoff-context"]
  },
  {
    name: "agent-cursor",
    kind: "agent",
    status: "planned",
    description: "Cursor rule and context provider.",
    capabilities: ["cursor", "rules", "handoff-context"]
  },
  {
    name: "agent-windsurf",
    kind: "agent",
    status: "planned",
    description: "Windsurf rule and context provider.",
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
