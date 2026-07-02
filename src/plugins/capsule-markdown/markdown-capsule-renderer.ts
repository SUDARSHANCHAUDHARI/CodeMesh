import type { CapsuleRendererPlugin, ContextCapsuleInput } from "../../core/plugins/types.js";

export class MarkdownCapsuleRenderer implements CapsuleRendererPlugin {
  readonly name = "capsule-markdown";

  render(input: ContextCapsuleInput): string {
    const { repository, task, knowledgeDocuments, agentProfiles } = input;

    return `# Context Capsule: ${repository.name}

## Task

${task}

## Repository

- Name: ${repository.name}
- Category: ${repository.category}
- Path: ${repository.path}
- Source: ${repository.source}
- Language: ${repository.primaryLanguage ?? "unknown"}
- Framework: ${repository.framework ?? "unknown"}
- Package manager: ${repository.packageManager ?? "unknown"}
- Branch: ${repository.currentBranch ?? "unknown"}
- Status: ${repository.hasChanges ? `dirty (${repository.changedFileCount ?? 0} changed files)` : "clean"}
- Last commit date: ${repository.lastCommitDate ?? "unknown"}
- Active status: ${repository.activeStatus}
- Last indexed: ${repository.lastSeenAt}

## Relevant Knowledge Sources

${knowledgeDocuments.map((doc) => `- ${doc.title} (${doc.source}): ${doc.path}`).join("\n") || "- None detected"}

## Agent Instructions

${agentProfiles.map((profile) => `- ${profile.agentType}: ${profile.instructionFilePath}`).join("\n") || "- None detected"}

## Suggested Agent Context

- Use the repository metadata above as the current workspace snapshot.
- Read the listed instruction files before making changes.
- Prefer relevant Obsidian paths listed above as references, not write targets.
- If repository status is dirty, inspect existing changes before editing.

## Operating Rules

- Obsidian is read-only for this MVP.
- Do not move, rename, or delete existing notes.
- Do not include secret files or local credentials in generated context.
- Use this capsule as portable context for Claude Code or Codex.
`;
  }
}
