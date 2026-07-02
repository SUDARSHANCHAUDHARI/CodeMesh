import type { CapsuleRendererPlugin, ContextCapsuleInput } from "../../core/plugins/types.js";

export class MarkdownCapsuleRenderer implements CapsuleRendererPlugin {
  readonly name = "capsule-markdown";

  render(input: ContextCapsuleInput): string {
    const { repository, task, template, knowledgeDocuments, agentProfiles } = input;

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

## Capsule Template

- Template: ${template}
${renderTemplateGuidance(template)}

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

function renderTemplateGuidance(template: ContextCapsuleInput["template"]): string {
  if (template === "codex") {
    return `- Intended agent: Codex
- Inspect the repository state before editing.
- Follow AGENTS.md before project-specific assumptions.
- Keep changes scoped to the task.
- Run relevant verification before claiming completion.
- Report changed files, checks run, and any remaining risk.`;
  }

  if (template === "claude") {
    return `- Intended agent: Claude Code
- Read CLAUDE.md before making changes.
- Respect Obsidian vault boundaries.
- Summarize changed files and reasoning at handoff.
- Keep generated memory or session output out of the vault unless explicitly approved.`;
  }

  return `- Intended agent: neutral portable context
- Use this capsule with any coding agent.
- Adapt the task plan to the target agent's normal workflow.`;
}
