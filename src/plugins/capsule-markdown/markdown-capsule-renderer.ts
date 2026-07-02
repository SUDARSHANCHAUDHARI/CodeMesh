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
- Package manager: ${repository.packageManager ?? "unknown"}

## Relevant Knowledge Sources

${knowledgeDocuments.map((doc) => `- ${doc.title}: ${doc.path}`).join("\n") || "- None detected"}

## Agent Instructions

${agentProfiles.map((profile) => `- ${profile.agentType}: ${profile.instructionFilePath}`).join("\n") || "- None detected"}

## Operating Rules

- Obsidian is read-only for this MVP.
- Do not move, rename, or delete existing notes.
- Do not include secret files or local credentials in generated context.
- Use this capsule as portable context for Claude Code or Codex.
`;
  }
}
